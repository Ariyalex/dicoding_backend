class Handler {
    constructor(modelService) {
        this._modelService = modelService;
        this.getPredictResult = this.getPredictResult.bind(this);
    }

    async getPredictResult(request, h) {
        try {
            const photo = request.payload;
            console.log('Request payload:', {
                hasFile: !!photo?.file,
                fileType: typeof photo?.file,
                filePath: photo?.file?.path,
                fileHapi: photo?.file?.hapi
            });

            if (!photo || !photo.file) {
                return h.response({
                    status: "fail",
                    message: "No file uploaded"
                }).code(400);
            }

            const predict = await this._modelService.predictImage(photo.file);
            const { diseaseLabel, confidenceScore } = predict;

            return h.response({
                status: "success",
                message: "Predict success",
                data: {
                    disease: diseaseLabel,
                    confidenceScore
                }
            });
        } catch (err) {
            console.error('getPredictResult error:', err.stack || err);
            return h.response({
                status: "error",
                message: "Predict failed",
                error: err.message || String(err)
            }).code(500);
        }
    }
}

module.exports = Handler;