const queueModel = require("../Models/queue.model");
const queueEntryModel = require("../Models/queueEntry.model");

const getAvailableQueuesController = async (req, res) => {
  try {
    const queues = await queueModel.find({
      isActive: true,
    });

    return res.status(200).json({
      message: "These are all available queues",
      queues,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Sorry, currently there is no queue is available",
    });
  }
};

const joinQueueController = async (req, res) => {
  try {
    const { queueId } = req.body;

    const io = req.app.get("io");

    if (!queueId) {
      return res.status(400).json({
        message: "Invalid queue id",
      });
    }

    const isValidQueueId = await queueModel.findById(queueId);

    if (!isValidQueueId) {
      return res.status(404).json({
        message: "Queue not found",
      });
    }

    if (isValidQueueId.isActive === false) {
      return res.status(400).json({
        message: "The services are not available right now",
      });
    }

    const existingEntry = await queueEntryModel.findOne({
      queue: isValidQueueId._id,
      user: req.user._id,
      status: {
        $in: ["WAITING", "SERVING"],
      },
    });

    if (existingEntry) {
      return res.status(400).json({
        message: "You are already in this queue",
      });
    }

    const nextToken = isValidQueueId.lastToken + 1;
    isValidQueueId.lastToken = nextToken;

    await isValidQueueId.save();

    const queueEntry = await queueEntryModel.create({
      queue: isValidQueueId._id,
      user: req.user._id,
      tokenNumber: nextToken,
    });

    io.to(isValidQueueId._id.toString()).emit("queue-updated", {
      queueId: isValidQueueId._id.toString(),
    });

    return res.status(201).json({
      message: "Joined queue successfully",
      queueEntry: {
        tokenNumber: queueEntry.tokenNumber,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const getMyQueueEntryController = async (req, res) => {
  const { queueId } = req.params;

  const myEntry = await queueEntryModel.findOne({
    queue: queueId,
    user: req.user._id,
    status: {
      $in: ["WAITING", "SERVING"],
    },
  });

  if (!myEntry) {
    return res.status(404).json({
      message: "You are not currently in any queue",
    });
  }

  const queue = await queueModel.findById(queueId);

  const peopleAhead = await queueEntryModel.countDocuments({
    queue: queueId,
    status: "WAITING",
    tokenNumber: {
      $lt: myEntry.tokenNumber,
    },
  });

  return res.status(200).json({
    message: "Your current status",
    myEntry,
    currentToken: queue.currentToken,
    peopleAhead,
  });
};

module.exports = {
  getAvailableQueuesController,
  joinQueueController,
  getMyQueueEntryController,
};
