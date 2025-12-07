const amqp = require("amqplib");

const init = async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const queue = "dicoding";
  const message = "selamat belajar ahh ambatukam";

  await channel.assertQueue(queue, {
    durable: true,
  });

  channel.sendToQueue(queue, Buffer.from(message));
  console.log("pesan berhasil dikirim");

  setTimeout(() => {
    connection.close();
  }, 1000);
};

init();
