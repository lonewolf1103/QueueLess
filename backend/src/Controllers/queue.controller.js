const app = require("../app");
const queueModel = require("../Models/queue.model");
const queueEntryModel = require("../Models/queueEntry.model");

const createQueueController = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Queue name is required",
    });
  }

  const queue = await queueModel.create({
    name: name,
    admin: req.user._id,
  });

  return res.status(201).json({
    message: "Queue is created successfully",
    queue,
  });
};

const getMyQueueController = async (req, res) => {
  const queues = await queueModel.find({
    admin: req.user._id,
  });

  return res.status(200).json({
    message: "This queues belongs to you",
    queues,
  });
};

const getQueueEntriesController = async (req, res) => {
  const { queueId } = req.params;

  const queue = await queueModel.findById(queueId);

  if (!queue) {
    return res.status(404).json({
      message: "Queue not found",
    });
  }

  if (!queue.admin.equals(req.user._id)) {
    return res.status(403).json({
      message: "Unauthorized, you cannot access to other's queue entries",
    });
  }

  const entries = await queueEntryModel
    .find({
      queue: queueId,
    })
    .populate({
      path: "user",
      select: ["username", "email"],
    });

  return res.status(200).json({
    message: "All queues entries",
    entries,
  });
};

const callNextController = async (req, res) => {
  const { queueId } = req.params;

  const io = req.app.get("io");

  const queue = await queueModel.findById(queueId);

  if (!queue) {
    return res.status(404).json({
      message: "Queue",
    });
  }

  if (!queue.admin.equals(req.user._id)) {
    return res.status(403).json({
      message: "Unauthorized, you cannot access to other's queue entries",
    });
  }

  const currentEntry = await queueEntryModel.findOne({
    queue: queueId,
    status: "SERVING",
  });

  if (currentEntry) {
    currentEntry.status = "COMPLETED";
    await currentEntry.save();

   
  }

  const nextEntry = await queueEntryModel
    .findOne({
      queue: queueId,
      status: "WAITING",
    })
    .sort({ tokenNumber: 1 });

  if (!nextEntry) {
    io.to(queueId).emit("queue-updated",{
      queueId: queueId
    })
    return res.status(200).json({
      message: "Current customer completed. No customers are waiting",
    });
  }

  nextEntry.status = "SERVING";
  await nextEntry.save();

  queue.currentToken = nextEntry.tokenNumber;
  await queue.save();

  io.to(queueId).emit("queue-update",{
    queueId: queueId
  })

  return res.status(200).json({
    message: "Next customer is now being served",
    nextEntry,
  });
};

const CompleteQueueEntryController = async (req, res) => {
  const { queueId } = req.params;

  const queue = await queueModel.findById(queueId);

  if (!queue) {
    return res.status(404).json({
      message: "Queue not found",
    });
  }

  if (!queue.admin.equals(req.user._id)) {
    return res.status(403).json({
      message: "Unauthorized, you cannot access to other's queue entries",
    });
  }

  const currentEntry = await queueEntryModel.findOne({
    queue: queueId,
    tokenNumber: queue.currentToken,
    status: "SERVING",
  });

  if (!currentEntry) {
    return res.status(400).json({
      message: "No customer is currently being served",
    });
  }

  currentEntry.status = "COMPLETED";
  await currentEntry.save();

  return res.status(200).json({
    message: "Ongoing customer has been served",
    currentEntry,
  });
};

const updatedQueueStatusController = async (req, res) => {
  const { queueId } = req.params;
  const { isActive } = req.body;

  const queue = await queueModel.findById(queueId);

  const io = req.app.get("io");

  if (!queue) {
    return res.status(404).json({
      message: "Queue not found",
    });
  }

  if (!queue.admin.equals(req.user._id)) {
    return res.status(403).json({
      message: "You are not authorized to modify this queue",
    });
  }

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      message: "Value must be boolean",
    });
  }

  queue.isActive = isActive;
  await queue.save();

  io.emit("queue-status-updated",{
    queueId: queueId,
    isActive: queue.isActive
  })

  return res.status(200).json({
    message: "Queue status updated successfully",
    queue: queue,
  });
};

module.exports = {
  createQueueController,
  getMyQueueController,
  getQueueEntriesController,
  callNextController,
  CompleteQueueEntryController,
  updatedQueueStatusController,
};
