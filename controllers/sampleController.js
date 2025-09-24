// controllers/sampleController.js

const SampleModel = require("../models/sampleModel");

const sampleController = {
  getSample: async (req, res) => {
    try {
      const data = await SampleModel.getSampleData();
      res.json(data);
    } catch (error) {
      console.error("Error in sampleController:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

module.exports = sampleController;