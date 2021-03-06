// ===============  保存关于时间戳 的处理转换方法 ===============
export const getDate = (timeStamp) => {
  let time = new Date(Number(timeStamp));
  let year = time.getFullYear();
  let month = time.getMonth() + 1;
  month = month > 10 ? month : "0" + month;
  let date = time.getDate();
  date = date >= 10 ? date : "0" + date;
  return year + "-" + month + "-" + date;
};

export const getDate2 = (timeStamp) => {
  let time = new Date(Number(timeStamp));
  let year = time.getFullYear();
  let month = time.getMonth() + 1;
  month = month > 10 ? month : "0" + month;
  let date = time.getDate();
  date = date >= 10 ? date : "0" + date;
  let hours = time.getHours();
  let min = time.getMinutes();
  let sec = time.getSeconds()
  return year + "-" + month + "-" + date + " " + hours + ":" + min + ":" + sec;
};
