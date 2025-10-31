const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-backend-cpu");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs/promises");
const metadata = require("../model/metadata.json");

class PredictService {
    constructor() {
        this.model = null;
    }

    async loadModel() {
        if (this.model) return this.model;

        await tf.ready();
        const modelPath = path.resolve(__dirname, "..", "model", "model.json");

        // Load model using custom handler to avoid fetch issues
        const modelJSON = JSON.parse(await fs.readFile(modelPath, 'utf-8'));
        const modelDir = path.dirname(modelPath);

        // Create custom IOHandler
        const handler = {
            load: async () => {
                const weightManifest = modelJSON.weightsManifest;
                const weightData = [];

                for (const group of weightManifest) {
                    for (const weightPath of group.paths) {
                        const fullPath = path.join(modelDir, weightPath);
                        const buffer = await fs.readFile(fullPath);
                        weightData.push(buffer.buffer);
                    }
                }

                return {
                    modelTopology: modelJSON.modelTopology,
                    weightSpecs: weightManifest.flatMap(m => m.weights),
                    weightData: new Uint8Array(Buffer.concat(weightData.map(b => new Uint8Array(b)))).buffer,
                    format: modelJSON.format,
                    generatedBy: modelJSON.generatedBy,
                    convertedBy: modelJSON.convertedBy
                };
            }
        };

        this.model = await tf.loadLayersModel(handler);
        return this.model;
    }

    async predictImage(photo) {
        try {
            console.log('predictImage called with:', typeof photo, photo?.path);
            const model = await this.loadModel();
            console.log('Model loaded successfully');

            // convert stream/path/Buffer to Buffer
            async function toBuffer(input) {
                if (Buffer.isBuffer(input)) return input;
                if (input && input.path) {
                    return await fs.readFile(input.path);
                }
                if (input && typeof input.pipe === "function") {
                    const chunks = [];
                    for await (const chunk of input) chunks.push(Buffer.from(chunk));
                    return Buffer.concat(chunks);
                }
                throw new Error("Unsupported photo input");
            }

            const imageBuffer = await toBuffer(photo);
            console.log('Image buffer size:', imageBuffer.length);

            // decode and resize using sharp, force 3 channels (RGB)
            const { data, info } = await sharp(imageBuffer)
                .resize(224, 224)
                .removeAlpha() // Remove alpha channel to get RGB
                .raw()
                .toBuffer({ resolveWithObject: true });

            console.log('Image processed, channels:', info.channels, 'size:', info.width, 'x', info.height);

            // create tensor from raw pixel data
            const tensor = tf.tensor3d(new Uint8Array(data), [224, 224, 3])
                .expandDims()
                .toFloat()
                .div(255.0);

            const predict = model.predict(tensor);
            const score = await predict.data();

            const confidenceScore = Math.max(...score);
            const label = tf.argMax(predict, 1).dataSync()[0];
            const diseaseLabels = metadata.labels;
            const diseaseLabel = diseaseLabels[label];

            tf.dispose([tensor, predict]);

            console.log('Prediction result:', { diseaseLabel, confidenceScore });
            return { confidenceScore, diseaseLabel };
        } catch (err) {
            console.error('predictImage error:', err.stack || err);
            throw err;
        }
    }
}

module.exports = PredictService;