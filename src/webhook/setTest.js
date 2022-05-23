const { testQueue, weeklyCredderUpdateQueue } = require("../config");
const { postToGetstream } = require("../processes/domain-process");
const serviceTestQueue = async (req, res) => {
  // let { url } = req.body
  // try {
  //   console.log("run test");
  //   const job = await weeklyCredderUpdateQueue.add({});
  //   console.log("job ", job.data);
  //   return res.json({
  //     ststus: "success",
  //     message: job,
  //   });
  // } catch (error) {
  //   console.log('error')
  //   console.log(error)
  //   return res.json({
  //     ststus: "error",
  //     message: error,
  //   });
  // }

  // let data = {
  //   domain_page_id: "f30fbb55-5116-40cb-9999-f7a08afc6ddc",
  //   title: "Coba tes",
  //   site_name: "",
  //   image: "",
  //   description: "",
  //   news_url: "",
  //   keyword: "",
  //   author: "",
  //   url_compact: ""
  // };

  // const activity = {
  //   domain: {
  //     name: "", 
  //     site_name : "", 
  //     info: "", 
  //     image: null, 
  //     domain_page_id: data.domain_page_id
  //   },

  //   content: { ...data, ...dateCreted }
  // }
  // await postToGetstream(activity)
};

module.exports = { serviceTestQueue };
