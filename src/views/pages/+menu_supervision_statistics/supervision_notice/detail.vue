<template>
  <div class="bigbox">
    <iframe class="pdf" :src="src"></iframe>

    <div class="title">*注：本表一式三份，发文单位、收文单位、城建档案管理机构各一份。</div>

    <div class="footer" v-if="isAdd">
      <el-button type="primary" @click="save">提交</el-button>
      <el-button @click="goToAdd">修改</el-button>
    </div>

    <div class="footer" v-else-if="isReview">
      <el-button @click="goToAdd" type="primary">修改</el-button>
      <el-button @click="pass" type="primary">审核通过</el-button>
      <el-button @click="fail" type="warning">退回</el-button>
      <el-button @click="goBack">返回</el-button>
    </div>

    <div class="footer" v-else>
      <el-button @click="goBack">返回</el-button>
    </div>
  </div>
</template>

<script>
import {
  projectQuestionInformDownload,
  projectQuestionInformUpdate,
} from "@/http/api.js";
import axios from "axios";
export default {
  data() {
    return {
      token: "",
      userid: "",
      id: "",

      src: "",

      isAdd: false,
      isReview: false,

      state: "",
    };
  },
  created() {
    let userInfo = this.$store.state.userInfo;
    this.token = userInfo.token;
    this.userid = userInfo.id;

    if (this.$route.query.id) {
      this.id = this.$route.query.id;
      this.getDetail();
    }

    this.isAdd = this.$route.query.isAdd;
    this.isReview = this.$route.query.isReview;

    this.state = this.$route.query.state;
  },
  methods: {
    /**
     * 获取详情
     * params: param
     * create by gzy
     * date:2020.09.07
     */
    async getDetail() {
      let param = { token: this.token, userid: this.userid, id: this.id };

      let res = await axios({
        method: "POST",
        url: axios.defaults.baseURL + "/projectQuestionInform/download",
        responseType: "blob",
        data: param,
      });

      let blob = new Blob([res.data], { type: `application/pdf` });

      if (this.state == 2) {
        this.src = window.URL.createObjectURL(blob) + "#toolbar=1";
      } else {
        this.src = window.URL.createObjectURL(blob) + "#toolbar=0";
      }
    },

    /**
     * 提交
     * params: param
     * create by gzy
     * date:2020.09.07
     */
    save() {
      this.$router.push({
        path: "/supervisionNotice/list",
      });
    },

    /**
     * 修改跳转
     * params: param
     * create by gzy
     * date:2020.09.07
     */
    goToAdd() {
      this.$router.push({
        path: "/supervisionNotice/add",
        query: {
          id: this.id,
        },
      });
    },

    /**
     * 返回上一页
     * params: none
     * create by gzy
     * date:2020.09.07
     */
    goBack() {
      this.$router.go(-1);
    },

    /**
     * 退回
     * params: none
     * create by gzy
     * date:2020.09.17
     */
    fail() {
      this.$prompt("请输入退回意见", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      }).then(({ value }) => {
        let param = {
          id: this.id,
          state: "4",
          returnMark: value,
        };

        projectQuestionInformUpdate(param).then((res) => {
          if (res.data.status == 0) {
            this.$router.push({
              path: "/supervisionNotice/list",
            });
          }
        });
      });
    },

    /**
     * 审核通过
     * params: none
     * create by gzy
     * date:2020.09.17
     */
    pass() {
      this.$confirm("确认通过此监理通知单？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        let param = {
          id: this.id,
          state: "2",
        };

        projectQuestionInformUpdate(param).then((res) => {
          if (res.data.status == 0) {
            this.$router.push({
              path: "/supervisionNotice/list",
            });
          }
        });
      });
    },
  },
};
</script>

<style lang="less" scoped>
.bigbox {
  padding: 40px;
  padding-bottom: 0px;
}

.pdf {
  width: 580px;
  height: 740px;
}

.title {
  margin-top: 10px;
  font-size: 13px;
}

.footer {
  width: 580px;
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>