<template>
  <div id="quality-inspect-save">
    <div class="item-select">
      <el-form :model="addCheckForm" :rules="rule" ref="addCheckForm" label-width="130px">
        <el-row class="row-item">
          <el-form-item label="项目名称:">
            <el-input :disabled="true" v-model="projectName" style="width:76%"></el-input>
          </el-form-item>
        </el-row>

        <el-row class="row-item">
          <el-form-item prop="buildId" label="楼栋:">
            <el-select
              placeholder="请选择"
              style="width:76%"
              v-model="addCheckForm.buildId"
              :disabled="mainId.length > 0"
              @change="changeBuild"
            >
              <el-option
                v-for="item in buildList"
                :key="item.id"
                :label="item.number"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-row>

        <el-row class="row-item">
          <el-form-item label="施工单位:">
            <el-select
              placeholder
              v-model="addCheckForm.bidUnitId"
              style="width:76%"
              :disabled="true"
              class="no-down"
            >
              <el-option
                v-for="item in unitList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-row>

        <el-row class="row-item">
          <el-form-item prop="wallNum" label="墙柱楼层:">
            <el-select
              placeholder="请选择"
              style="width:76%"
              v-model="addCheckForm.wallNum"
              :disabled="mainId.length > 0"
              filterable
            >
              <el-option v-for="item in floorNUmList" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
        </el-row>

        <el-row class="row-item">
          <el-form-item prop="beamNum" label="梁板楼层:">
            <el-select
              placeholder="请选择"
              style="width:76%"
              v-model="addCheckForm.beamNum"
              :disabled="mainId.length > 0"
              filterable
            >
              <el-option v-for="item in beamNumList" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
        </el-row>

        <el-row class="row-item">
          <el-form-item prop="mixedUnitId" label="商混供应单位:">
            <el-select
              placeholder="请选择"
              style="width:76%"
              v-model="addCheckForm.mixedUnitId"
              :disabled="mainId.length > 0"
              filterable
            >
              <el-option
                v-for="item in mixnUnitList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-row>
      </el-form>
    </div>

    <div class="mixed-info-wrap">
      <mixedInfo ref="mixedInfo" :showMixedList="true" :isWall="true"></mixedInfo>
    </div>
    <div class="add-auestion-wrap">
      <addQuestionsNew code="040102020401" ref="addQuestion" :showOtherPostion="false"></addQuestionsNew>
    </div>
    <div class="accept-img" v-if="showAcceptance == true">
      <acceptanceImage ref="acceptanceImage"></acceptanceImage>
    </div>

    <div class="btn-box">
      <el-row class="row-item row-button">
        <el-button size="medium" type="primary" @click="save">保存</el-button>
        <el-button size="medium" @click="cancel">取消</el-button>
      </el-row>
    </div>
  </div>
</template>

<script>
import {
  qualityCheckList,
  qualityChecBaseBetonAdd,
  getBuildList,
  getFloorByBuild,
  queryBuildFloor,
  maintableAdd,
  maintableList,
  maintableUpdate,
} from "@/http/api.js";
import { judgeErroCode } from "@/utils/errorCode.js";
export default {
  name: "acceptanceRaftRebarAdd",
  data() {
    return {
      code: "",
      projectName: "",
      projectId: "",
      addCheckForm: {
        buildId: "",
        bidUnitId: "",
        mixedUnitId: "",
        beamNum: "",
        wallNum: "",
      },
      buildList: [],
      unitList: [],
      beamNumList: [],
      floorNUmList: [],
      mixnUnitList: [],
      rule: {
        mixedUnitId: [
          { required: true, message: "请填写供应单位", trigger: "blue" },
        ],
        buildId: [{ required: true, message: "请选择楼栋", trigger: "change" }],
        beamNum: [
          { required: true, message: "请选择墙柱楼层", trigger: "change" },
        ],
        wallNum: [
          { required: true, message: "请选择梁板楼层", trigger: "change" },
        ],
      },
      mainId: "",
      tableId: "",
      checkedArr: [], // 问题选中的列表，做回显
      timer: "",
      review: "",
      isUpdate: "",
      qustionStatus: "",
      showAcceptance: true,
    };
  },
  created() {
    let userInfo = this.$store.state.userInfo;
    this.projectName = userInfo.currProjectName;
    this.projectId = userInfo.currProjectId;
    if (this.$route.query) {
      this.code = this.$route.query.code;
    }
    if (this.$route.query.mainId) {
      this.mainId = this.$route.query.mainId;
    }
    if (this.$route.query.tableId) {
      this.tableId = this.$route.query.tableId;
      this.getChcekedData();
    }
    if (this.$route.query.isUpdate) {
      this.isUpdate = this.$route.query.isUpdate;
    }
    if (this.$route.query.review) {
      this.review = this.$route.query.review;
    }
    this.getbuildListArr();
  },
  destroyed() {
    clearTimeout(this.timer);
  },
  methods: {
    /**
     * 获取楼栋列表
     * params：none
     * create by YuXiong
     * date:2020-8-19
     */
    async getbuildListArr() {
      let params = {
        projectId: this.projectId,
      };
      let res = await getBuildList(params);
      if (res.data.status === "0") {
        this.buildList = res.data.data;
      } else {
        judgeErroCode(res.data.status, res.data.message);
      }
    },

    /**
     * 获取单位
     * params：id
     * create by YuXiong
     * date:2020-8-19
     */
    async getUnitList(id) {
      let params = {
        id: id,
        projectId: this.projectId,
      };
      let res = await getFloorByBuild(params);
      if (res.data.status === "0") {
        this.unitList = res.data.data.unitlist;
        this.floorNUmList = res.data.data.floorlist;
        this.addCheckForm.bidUnitId = this.unitList[0].id;
      } else {
        judgeErroCode(res.data.status, res.data.message);
      }
    },

    /**
     * 获取梁板楼层
     * params：id
     * create by YuXiong
     * date:2020-8-19
     */
    async getbeamNumListList(id) {
      let params = {
        id: id,
        projectId: this.projectId,
        kind: "2",
      };
      let res = await queryBuildFloor(params);
      if (res.data.status === "0") {
        this.beamNumList = res.data.data.floorlist;
        this.mixnUnitList = res.data.data.mixnUnitList;
      } else {
        judgeErroCode(res.data.status, res.data.message);
      }
    },

    /**
     * 地下室列表change事件
     * params：code
     * create by YuXiong
     * date:2020-6-31
     */
    changeBuild(id) {
      this.addCheckForm.bidUnitId = "";
      this.addCheckForm.beamNum = "";
      this.addCheckForm.wallNum = "";
      this.addCheckForm.mixedUnitId = "";
      this.getUnitList(id);
      this.getbeamNumListList(id);
    },

    /**
     * 获取回选数据
     * params:none
     * create by YuXiong
     * date:2020-7-7
     */
    async getChcekedData() {
      let params = {
        pageNum: 1,
        pageSize: 100,
        parentId: this.tableId,
        mainId: this.mainId,
      };
      let res = await maintableList(params);
      if (res.data.status === "0") {
        if (res.data.data && res.data.data.headParam.length > 0) {
          this.filterList = res.data.data.headParam;
          this.addCheckForm = this.$formMap(
            res.data.data.headParam,
            this.addCheckForm
          );
          this.getUnitList(this.addCheckForm.buildId);
          this.getbeamNumListList(this.addCheckForm.buildId);
          this.mixInfoList = JSON.parse(
            this.filterList.find((item) => item.key === "mixedInfo").value
          );
          let item = res.data.data.publiList[0];
          this.$refs["mixedInfo"].mixedList = JSON.parse(
            res.data.data.headParam.find((ele) => ele.key === "mixedInfo").value
          );
          if (item.isMain === "1") {
            this.$refs["mixedInfo"].mixedListObj.car = item.bodyParam.find(
              (ele) => ele.key === "carPumps"
            ).value;
            this.$refs["mixedInfo"].mixedListObj.earth = item.bodyParam.find(
              (ele) => ele.key === "landPumps"
            ).value;
            this.$refs["mixedInfo"].mixedListObj.shock = item.bodyParam.find(
              (ele) => ele.key === "vibrateSpear"
            ).value;
            this.$refs["mixedInfo"].mixedListObj.people = item.bodyParam.find(
              (ele) => ele.key === "people"
            ).value;
            this.$refs["addQuestion"].checkedArr = item.quessVOList;
            if (item.otherquessVOList.length > 0) {
              item.otherquessVOList.forEach((ele) => {
                ele.isChecked = true;
              });
              this.$refs["addQuestion"].otherList = item.otherquessVOList;
            }
            this.$refs[
              "addQuestion"
            ].qualified = this.qustionStatus = item.bodyParam.find(
              (item) => item.key === "status"
            ).value;
            if (this.$refs["acceptanceImage"]) {
              this.$refs["acceptanceImage"].fileList = item.bodyParam.find(
                (item) => item.key === "checkInfo"
              ).fileList;
            }
          }
        }
      }
    },
    /**
     *保存
     * params:none
     * create by YuXiong
     * date:2020-6-29
     */
    async save() {
      this.$refs.addCheckForm.validate((valid) => {
        if (valid === true) {
          let numObj = this.$refs["mixedInfo"].mixedListObj;
          let params = {
            tcode: "040102020401",
            projectId: this.projectId,
            buildId: this.addCheckForm.buildId,
            bidUnitId: this.addCheckForm.bidUnitId,
            mixedUnitId: this.addCheckForm.mixedUnitId,
            beamNum: this.addCheckForm.beamNum,
            wallNum: this.addCheckForm.wallNum,
            landPumps: numObj.earth, //地磅数量
            vibrateSpear: numObj.shock, //震动棒数量
            carPumps: numObj.car, //  汽车棒数量
            people: numObj.people, // 泥工人数
            mainId: this.mainId, // 主表id
            tableId: this.tableId,
            isMain: "1", // 主表传1
            isMany: "1", //单表传0，多表传1
            questionInfo: [],
            otherQuestionInfo: this.$refs["addQuestion"].otherList.filter(
              (item) => item.isChecked === true
            ),
            isQuestion: "0",
            checkInfo: this.$refs["acceptanceImage"]
              ? this.$refs["acceptanceImage"].fileList
              : [],
            status: this.$refs["addQuestion"].qualified,
            mixedInfo: this.$refs["mixedInfo"].mixedList, //混凝土信息
          };
          if (params.people.length === 0) {
            this.$message({ type: "error", message: "请填写泥工人数" });
            return false;
          }

          let checkList = this.$refs["addQuestion"].checkList;
          let checkedArr = checkList.filter((item) => item.isChecked === true);
          if (checkedArr.length > 0) {
            checkedArr.forEach((item) => {
              let obj = {};
              obj.id = item.id;
              obj.content = item.content;
              obj.tPostion = item.tPostion;
              obj.fileList = item.fileList;
              params.questionInfo.push(obj);
            });
            params.isQuestion = "1";
          }
          if (params.otherQuestionInfo.length > 0) {
            params.isQuestion = "1";
          }
          if (this.mainId.length === 0) {
            this.addFun(params);
          } else {
            params.tableList = [
              ...params.questionInfo,
              ...params.otherQuestionInfo,
            ];
            params.tableId = this.id;
            params.questionInfo = [];
            params.otherQuestionInfo = [];
            this.editFun(params);
          }
        } else {
          this.$message({ type: "error", message: "请确认填写所有必填项" });
        }
      });
    },

    /**
     * 添加调用方法
     * params:none
     * create by YuXiong
     * date:2020-8-20
     */
    addFun(params) {
      maintableAdd(params)
        .then((res) => {
          if (res.data.status === "0") {
            this.$message({ type: "success", message: "提交成功！" });
            this.$router.push({
              path: "/qualityCheck/mainStructure/concrete/detail",
              query: {
                code: this.code, // 检查分项
                tableId: res.data.data.tableId,
                mainId: res.data.data.mainId,
                review: this.review,
              },
            });
          } else {
            judgeErroCode(res.data.status, res.data.message);
          }
        })
        .catch((err) => {
          this.$message({ type: "error", message: "提交失败！" });
        });
    },

    /**
     * 编辑调用方法
     * params:none
     * create by YuXiong
     * date:2020-8-20
     */
    editFun(params) {
      maintableUpdate(params).then((res) => {
        if (res.data.status === "0") {
          this.$message({ type: "success", message: "提交成功!" });
          this.$router.push({
            path: "/qualityCheck/mainStructure/concrete/detail",
            query: {
              code: this.code,
              tableId: this.tableId,
              mainId: this.mainId,
              review: this.review,
            },
          });
        } else {
          this.$message({ type: "error", message: res.data.message });
        }
      });
    },
    /**
     * 点击取消，退回列表页
     * params:none
     * create by YuXiong
     * date:2020-6-29
     */
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped lang='less'>
.wrap {
  width: 100%;
  height: 400px;
  overflow-y: auto;
}
.list-item {
  width: 1200px;
  margin: 40px 0 0 40px;
  border-bottom: 1px dashed #eee;
  padding-bottom: 20px;
  .row-item {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  .item-button {
    width: 120px;
    height: 30px;
    padding: 0;
  }
  .right {
    text-align: right;
  }
}
.red-span {
  color: #f00;
}
.row-upload {
  margin: 20px 0 0 0;
  overflow: hidden;
  padding-right: 20px;
}
.btn-box {
  height: 70px;
  box-sizing: border-box;
  padding-top: 20px;
  .row-button {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}
/deep/ textarea {
  height: 80px;
}
.item-select {
  width: 1200px;
  margin: 40px 0 0 60px;
  .row-item {
    margin-top: 20px;
    span {
      width: 140px;
      display: inline-block;
      color: #999;
      font-size: 14px;
    }
  }
}
/deep/ .el-checkbox,
.el-checkbox__input {
  white-space: normal;
  word-break: break-all;
}
/deep/ input::-webkit-outer-spin-button,
/deep/ input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
/deep/ input[type="number"] {
  -moz-appearance: textfield;
}
/deep/.el-input.is-disabled .el-input__inner {
  background-color: transparent;
  border: 0;
}
/deep/ .no-down.el-select .el-input .el-select__caret {
  display: none;
}
.mixed-info-wrap {
  width: 1200px;
  margin: 4px 0 0 60px;
  padding: 20px 0;
  border-top: 1px dashed #ccc;
  border-bottom: 1px dashed #ccc;
}
/deep/ .el-input-group__prepend {
  background-color: transparent;
  border: 0;
}
/deep/ .el-form-item__label {
  text-align: left;
  width: 100px;
}
.add-auestion-wrap {
  margin-left: 40px;
}
.accept-img {
  width: 1200px;
  margin: 40px 0 0 40px;
}
</style>