<template>
  <div class="basement-daily-add-container">
    <el-form
      ref="addCheckForm"
      class="add-form"
      :rules="rule"
      :model="addCheckForm"
      label-width="150px"
    >
      <el-row>
        <el-form-item label="项目名称">
          <el-col :span="8">
            <el-input v-model="projectName" :disabled="true"></el-input>
          </el-col>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="楼栋:" prop="buildId">
          <el-select
            placeholder="请选择"
            v-model="addCheckForm.buildId"
            style="width:76%"
            :disabled="tableId.length > 0"
            @change="buildChange"
            class="no-down"
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
      <el-row>
        <el-form-item prop="bidUnitId" label="施工单位:">
          <el-select
            placeholder="请选择"
            v-model="addCheckForm.bidUnitId"
            style="width:76%"
            :disabled="tableId.length > 0"
            class="no-down"
          >
            <el-option v-for="item in unitList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-row>

      <el-row v-if="showSubUnit">
        <el-form-item prop="subUnitId" label="分包单位:">
          <el-select
            placeholder="请选择"
            v-model="addCheckForm.subUnitId"
            style="width:76%"
            :disabled="tableId.length > 0"
            class="no-down"
          >
            <el-option
              v-for="item in  subUnitIdList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="楼层:" prop="floorNum">
          <el-select
            placeholder="请选择"
            v-model="addCheckForm.floorNum"
            style="width:76%"
            :disabled="tableId.length > 0"
            class="no-down"
          >
            <el-option v-for="item in floorNUmList" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
      </el-row>

      <el-row v-if="showPeople == true">
        <el-form-item label="模板木工人数:" prop="people">
          <el-input v-model="addCheckForm.people" type="number" style="width:76%"></el-input>
        </el-form-item>
      </el-row>
    </el-form>

    <div class="add-questions-wrap">
      <addQuestionsNew :code="code" ref="addQuestion" :showOtherPostion="true"></addQuestionsNew>
      <div v-if="showMeasured == true">
        <div class="measured-title">{{measuredTitle}}</div>
        <addInputList :inputLists="inputLists" ref="inputLists"></addInputList>
      </div>
    </div>

    <div class="accept-img" v-if="showAcceptance == true">
      <acceptanceImage ref="acceptanceImage"></acceptanceImage>
    </div>

    <div class="btn-box">
      <div class="actions">
        <el-button type="primary" size="medium" @click="saveAdd">提交</el-button>
        <el-button size="medium" @click="goBack">返回</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getBuildList,
  maintableAdd,
  getFloorByBuild,
  maintableList,
  maintableUpdate,
  queryBuildFloor,
} from "@/http/api.js";
import { judgeErroCode } from "@/utils/errorCode.js";
export default {
  data() {
    return {
      projectName: "",
      projectId: "",
      code: "",
      tableId: "",
      buildList: [],
      floorNUmList: [],
      addCheckForm: {
        bidUnitId: "", //施工单位
        buildId: "",
        floorNum: "",
        people: "",
        subUnitId: "",
      },
      unitList: [],
      subUnitIdList: [],
      rule: {
        bidUnitId: [
          { required: true, message: "请选择施工单位", trigger: "change" },
        ],
        buildId: [{ required: true, message: "请选择楼栋", trigger: "change" }],
        floorNum: [
          { required: true, message: "请选择楼层", trigger: "change" },
        ],
        people: [{ required: true, message: "请输入人数", trigger: "blue" }],
        subUnitId: [
          { required: true, message: "请选择分包单位", trigger: "change" },
        ],
      },
      checkedArr: [],
      inputLists: [],
      qustionStatus: "",
      showMeasured: true,
      showAcceptance: true,
      measuredTitle: "",
      showPeople: false,
      showSubUnit: false,
      timer: "",
    };
  },
  created() {
    let userInfo = this.$store.state.userInfo;
    this.projectName = userInfo.currProjectName;
    this.projectId = userInfo.currProjectId;
    if (this.projectId.length > 0) {
      this.getbuildListArr();
    }
    if (this.$route.query.code) {
      this.code = this.$route.query.code;
    }
    // 是否显示实测内容，默认显示
    if (
      this.code === "0401020202" ||
      this.code === "0401020205" ||
      this.code === "0401020224" ||
      this.code === "0401020206" ||
      this.code === "0401020208" ||
      this.code === "0401020207"
    ) {
      this.showMeasured = false;
    }
    if (this.$route.query.tableId) {
      this.tableId = this.$route.query.tableId;
      this.getChcekedData();
    }
    //  是否显示模板工人数，默认不显示，传入此参数均为显示
    if (this.code === "0401020205") {
      this.showPeople = true;
    }

    //  是否显示分包单位，默认不显示，传入此参数均为显示
    if (this.code === "0401020224") {
      this.showSubUnit = true;
    }
    /**
     * 2 -- 主体结构阶段梁板钢筋检查验收表
     * 3 -- 主体填充墙砌体检查表
     */
    if (this.$route.query.measured) {
      if (this.$route.query.measured === "2") {
        this.inputLists = JSON.parse(
          JSON.stringify(this.commonData.mainStructureWallRebalMeasured2)
        );
        this.measuredTitle = "梁板钢筋实测项";
      } else if (this.$route.query.measured === "3") {
        this.inputLists = JSON.parse(
          JSON.stringify(this.commonData.mainStructureWallRebalMeasured3)
        );
        this.measuredTitle = "砌体实测项";
      }
    } else {
      this.inputLists = JSON.parse(
        JSON.stringify(this.commonData.mainStructureWallRebalMeasured)
      );
      this.measuredTitle = "墙柱钢筋实测项";
    }
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
     * 获取单位和楼层列表
     * params：id
     * create by YuXiong
     * date:2020-8-19
     */
    async getUnitAndFloumList(id) {
      let params = {
        id: id,
        projectId: this.projectId,
        kind: "2",
      };
      let res = await queryBuildFloor(params);
      if (res.data.status === "0") {
        this.unitList = res.data.data.unitlist;
        this.floorNUmList = res.data.data.floorlist;
        this.subUnitIdList = res.data.data.subUnitList;
      } else {
        judgeErroCode(res.data.status, res.data.message);
      }
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
      };
      let res = await maintableList(params);
      if (res.data.status === "0") {
        if (res.data.data && res.data.data.headParam.length > 0) {
          this.addCheckForm = this.$formMap(
            res.data.data.headParam,
            this.addCheckForm
          );
          this.getbuildListArr();
          this.getUnitAndFloumList(this.addCheckForm.buildId);
          let dataObject = res.data.data.publiList[0];
          this.timer = setTimeout(() => {
            this.$refs["addQuestion"].checkedArr = dataObject.quessVOList;
          }, 300);

          if (dataObject.otherquessVOList.length > 0) {
            dataObject.otherquessVOList.forEach((item) => {
              item.isChecked = true;
            });
            this.$refs["addQuestion"].otherList = dataObject.otherquessVOList;
          }
          let infoList = res.data.data.publiList[0].bodyParam;

          //  验收照片---数据
          if (this.$refs["acceptanceImage"]) {
            this.$refs["acceptanceImage"].fileList = infoList.find(
              (item) => item.key === "checkInfo"
            ).fileList;
          }

          // 实测--列表
          if (infoList.find((item) => item.key === "baseSpace")) {
            this.inputLists = JSON.parse(
              infoList.find((item) => item.key === "baseSpace").value
            );
          }

          //  问题列表---数据
          this.$refs[
            "addQuestion"
          ].qualified = this.qustionStatus = infoList.find(
            (item) => item.key === "status"
          ).value;

          //  实测--状态
          if (this.$refs["inputLists"]) {
            this.$refs["inputLists"].status = infoList.find(
              (item) => item.key === "measuredStatus"
            ).value;
          }
        }
      }
    },
    /**
     * 楼栋change重新获取施工单位和楼层
     * params:none
     * create by YuXiong
     * date:2020-7-21
     */
    buildChange(id) {
      this.addCheckForm.bidUnitId = "";
      this.unitList = [];
      this.addCheckForm.floorNUm = "";
      this.floorNUmList = [];
      this.getUnitAndFloumList(id);
    },

    /**
     * 点击返回按钮
     */
    goBack() {
      this.$router.go(-1);
    },
    /**
     * 点击提交
     * params:none
     * create by YuXiong
     * date:2020-7-21
     */
    async saveAdd() {
      this.$refs.addCheckForm.validate((valid) => {
        if (valid === true) {
          let params = {
            projectId: this.projectId,
            tcode: this.code,
            buildId: this.addCheckForm.buildId,
            bidUnitId: this.addCheckForm.bidUnitId,
            subUnitId: this.addCheckForm.subUnitId,
            floorNum: this.addCheckForm.floorNum,
            people: this.addCheckForm.people,
            isMain: "1", // 主表传1
            isMany: "0", //单表传0
            questionInfo: [],
            measuredTitle: this.measuredTitle,
            otherQuestionInfo: this.$refs["addQuestion"].otherList.filter(
              (item) => item.isChecked === true
            ),
            isQuestion: "0",
            checkInfo: this.$refs["acceptanceImage"]
              ? this.$refs["acceptanceImage"].fileList
              : [],
            status: this.$refs["addQuestion"].qualified,
            baseSpace: this.inputLists,
            measuredStatus: this.$refs["inputLists"]
              ? this.$refs["inputLists"].status
              : "",
          };

          let checkList = this.$refs["addQuestion"].checkList;
          let checkedArr = checkList.filter((item) => item.isChecked === true);
          params.questionInfo = checkedArr;
          if (checkedArr.length > 0 || params.otherQuestionInfo.length > 0) {
            params.isQuestion = "1";
          }
          //  实测至少上传N+1张图片1111
          if (this.$refs["inputLists"]) {
            for (let item of this.inputLists) {
              let inputLength = Object.keys(item).filter(
                (ele) => ele.indexOf("word") > -1
              ).length;
              let picLength = item.fileList.length;
              if (picLength < inputLength + 1) {
                this.$message({
                  type: "error",
                  message: `实测项每一项至少上传${inputLength + 1}张图片`,
                });
                return false;
              }
            }
          }
          if (this.tableId.length === 0) {
            this.addFun(params);
          } else {
            params.tableList = [
              ...params.questionInfo,
              ...params.otherQuestionInfo,
            ];
            params.tableId = this.tableId;
            params.questionInfo = [];
            params.otherQuestionInfo = [];
            this.editFun(params);
          }
        } else {
          this.$message({ type: "error", message: "请填写必须项!" });
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
              path: "/qualityCheck/mainStructure/wallRebar/detail",
              query: {
                tableId: res.data.data.tableId,
                code: this.code,
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
            path: "/qualityCheck/mainStructure/wallRebar/detail",
            query: {
              tableId: res.data.data.tableId,
              code: this.code,
            },
          });
        } else {
          this.$message({ type: "error", message: res.data.message });
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
.add-form {
  margin-top: 40px;
  margin-left: 40px;
  margin-right: 40px;
  border-bottom: 1px solid #eee;
  /deep/.el-form-item__label {
    text-align: left;
  }
}

.btn-box {
  height: 70px;
  box-sizing: border-box;
  padding-top: 20px;
  .actions {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}

/deep/.el-input.is-disabled .el-input__inner {
  background-color: transparent;
  border: 0;
}

/deep/ .no-down.el-select .el-input .el-select__caret {
  display: none;
}
.red {
  color: #f00;
}
/deep/ input::-webkit-outer-spin-button,
/deep/ input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
/deep/ input[type="number"] {
  -moz-appearance: textfield;
}
/* /deep/ .no-down.el-select .el-input .el-select__caret {
  display: none;
} */
.add-questions-wrap {
  width: 1200px;
  margin: 40px 0 0 40px;
}
.accept-img {
  width: 1200px;
  margin: 40px 0 0 40px;
}
.measured-title {
  font-size: 14px;
  color: #999;
  margin-top: 40px;
  border-top: 1px solid #ddd;
  padding-top: 20px;
}
</style>