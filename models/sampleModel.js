// models/sampleModel.js

const SampleModel = {
  getSampleData: async () => {
    // 실제로는 DB에서 조회하는 로직이 들어갑니다
    return { message: "This is sample data from the model" };
  }
};

module.exports = SampleModel;