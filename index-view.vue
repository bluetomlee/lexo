<dependency component="ListView" src="@ali/vue-component-list-view" lazy></dependency>
<dependency component="ErrorPageApp" src="common/components/index/error-page.vue" lazy></dependency>
<dependency component="PictureTextCard" src="common/components/talent/picturetext-card.vue" lazy></dependency>
<dependency component="VideoCard" src="common/components/talent/video-card.vue" lazy></dependency>
<dependency component="Loading" src="./loading.vue" lazy></dependency>

<template>
  <div id="app" class="talent-box-page">
    <loading v-if="loading"></loading>

    <ListView
      ref="listView"
      class="talent-box-list"
      v-else-if="!loading && !pageError"
      :on-scroll-bottom="onLoadMore"
      :on-scroll="onScroll"
    >
      <template v-for="(item, index) in feedList">
        <div
          :key="index"
          class="last-read-tip"
          v-if="index !== 0 && lastReadContentId === (item.appContentItemVO || {}).itemId"
        >
          <i class="smile-icon"></i>上次看到这里
        </div>

        <PictureTextCard
          v-if="checkType(item, 'article')"
          :key="(item.appContentItemVO || {}).itemId"
          :app="item"
          :pageType="'BOX'"
          :index="index"
        />

        <VideoCard
          v-else-if="checkItIsVideo(item)"
          :key="(item.appContentItemVO || {}).itemId"
          :app="item"
          :pageType="'BOX'"
          :index="index"
        />
      </template>

      <template slot="bottom" scope="state">
        <div class="talent-box-footer">
          <span
            v-if="state.loadAvailable && state.loading"
            @click="onLoadMore"
          >查看更多</span>

          <span v-else-if="state.loading">加载中...</span>

          <span v-else-if="state.loadError">请稍后再试</span>

          <div
            class="talent-box-nomore"
            v-else-if="state.loadFinish"
          >
            <span>我是有底线的</span>
          </div>
        </div>
      </template>
    </ListView>

    <ErrorPageApp
      v-else-if="pageError"
      :errType="pageError.errType"
      :errTips="pageError.errTips"
    />
</div>
</template>

<style lang="scss" rel="stylesheet/scss">
  @import '~common/css/base.mix.scss';

  body {
    background: #f5f5f5;
  }

  .talent-box-page {
    .common-error-page {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;

      background: #fff;
    }
  }

  .talent-box-list {
    .talent-picture-card {
      margin-top: 0.08rem;

      &.readed {
        .talent-picture-name {
          color: #999;
        }
      }
    }

    .last-read-tip {
      height: rem(50);
      line-height: rem(50);

      font-family: "PingFangSC-Regular";
      font-size: rem(12);
      text-align: center;
      color: #999;

      .smile-icon {
        display: inline-block;
        position: relative;
        width: 12px;
        height: 12px;
        margin-right: rem(6);
        vertical-align: middle;
      }
      .smile-icon::after {
        content: '';
        position: absolute;
        left: 2px;
        top: -1px;

        width: 2px;
        height: 2px;

        border-radius: 50%;
        background: currentColor;
        box-shadow: 8px 0 0 currentColor;
      }
      .smile-icon::before {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;

        width: 12px;
        height: 12px;

        border-radius: 50%;
        border: 1px solid currentColor;
        border-top-color: transparent;
        border-left-color: transparent;

        transform: scaleY(0.85) rotate(45deg);
      }
    }

    .talent-box-footer {
      margin-top: rem(20);
      padding-bottom: rem(20);

      font-size: 0.13rem;
      text-align: center;
      color: #ccc;

      .talent-box-nomore {
        position: relative;

        &::before {
          content: '';

          position: absolute;
          left: rem(64);
          right: rem(64);
          top: 50%;

          height: 1px;
          background: #ddd;

          z-index: -1;
        }

        span {
          padding: 0 rem(10);
          background: #f5f5f5;
        }
      }
    }
  }

  // -- 适配iPhoneX --
  @media only screen
  and (device-width: 375px)
  and (device-height: 812px)
  and (-webkit-device-pixel-ratio: 3) {
    .talent-box-list {
      padding-bottom: rem(44);
    }
  }
</style>

<script type="text/javascript">
  import { Component } from '@ali/kylin-framework';

  import { openPage } from 'common/utils/bridge';

  import * as Config from 'common/utils/config';

  import { infoLog, reportPV, exposureLog } from 'common/utils/log';

  const USER_BEHAVE_TYPE = {
    HOME: 'HOME',

    PAGE: 'PAGE',

    PULL_REFRESH: 'PULL_REFRESH'
  };

  @Component({
    mapStateToProps: {
      loading: state => state.loading,

      pageError: state => state.pageError,

      feedList: state => state.feedList,

      lastReadContentId: state => state.lastReadContentId
    }
  })
  class TalentBox {
    props = {
      loading: Boolean,
      pageError: Object,
      feedList: Array,
      lastReadContentId: String,
    }

    loadAppList (payload) {
      return this.$store.dispatch('loadAppList', payload);
    }

    // 翻页加载
    // 异步数据加载成功
    // success();
    // 异步数据加载成功, 并且没有下一页（之后不再触发）
    // success(true);
    // 异步数据加载失败，等待下一次scroll触发
    // fail();
    onLoadMore (successCallback, failCallback) {
      this
        .loadAppList({
          feedsType: USER_BEHAVE_TYPE.PAGE,
        })
        .then((result) => {
          this.$nextTick(() => {
            this.onScroll();
          });
          successCallback(!result.hasMore);
        })
        .catch(() => {
          failCallback();
        });
    }

    // 滚动式计算曝光上报
    onScroll () {
      if (!this.$refs.listView) {
        return;
      }

      const cards = this.$refs.listView.$children;

      cards.forEach((card, index) => {
        exposureLog(card.$el, () => {
          const {
            appId,
          } = card.props.app || {};

          const {
            itemId
          } = card.appContentItemVO || {};

          infoLog({
            spmId: `a68.b8236.c19770_${index}`,
            actionId: 'exposure',
            params: {
              BizType: Config.queryBizType, // 内容来源
              ContentId: itemId, // 内容id（新）
              PublicId: appId // 来源生活号id
            }
          });
        });

        exposureLog(card.$el.querySelector('.talent-picture-header'), () => {
          const {
            appId,
          } = card.props.app || {};

          infoLog({
            spmId: `a68.b8236.c19770_${index}.d35858`,
            actionId: 'exposure',
            params: {
              BizType: Config.queryBizType, // 内容来源
              PublicId: appId // 来源生活号id
            }
          });
        });

        exposureLog(card.$el.querySelector('.talent-picture-body'), () => {
          const {
            appId,
            contentId
          } = card.props.app || {};

          const {
            scm
          } = card.appContentItemVO || {};

          infoLog({
            spmId: `a68.b8236.c19770_${index}.d35860`,
            actionId: 'exposure',
            params: {
              scm,
              BizType: Config.queryBizType, // 内容来源
              ContentId: contentId, // 内容id（新）
              PublicId: appId // 来源生活号id
            }
          });
        });
      });
    }

    // 初始化页面
    initPage ({ feedsType }) {
      this
        .loadAppList({
          feedsType,
        })
        .then((result) => {
          this.$nextTick(() => {
            if (this.$refs.listView) {
              this.$refs.listView[result.hasMore ? 'setNormal' : 'setNoMore']();
            }
          });

          this.onScroll();

          // 只需要 初始化 UI 一次， pullRefresh 不需要再次 init
          if (feedsType === USER_BEHAVE_TYPE.HOME) {
            this.initUI();
          }

          this.refreshing = false;
        })
        .catch(() => {
          ap.hideOptionButton();

          this.refreshing = false;
        });
    }

    initUI () {
      // 点击右上角
      ap.setOptionButton({
        items: [
          {
            icon: 'https://gw.alipayobjects.com/zos/rmsportal/MDdriwLdRGAlSJeLaTeN.png',
          }
        ],

        // 进入达人列表
        onClick () {
          infoLog({
            spmId: 'a68.b8236.c19771.d35855',
            actionId: 'clicked'
          });

          openPage(Config.myFollowUrl, {
            pullRefresh: false
          });
        }
      });
      ap.showOptionButton();

      // 下拉刷新
      // 盒子点击的链接：alipays://platformapi/startapp?appId=60000071&pullRefresh=YES&allowsBounceVertical=YES&canPullDown=YES&url=%2Fwww%2FtalentBox.html
      document.addEventListener('firePullToRefresh', (e) => {
        e.preventDefault();

        if (this.refreshing) {
          return;
        }

        this.refreshing = true;

        this.initPage({
          feedsType: USER_BEHAVE_TYPE.PULL_REFRESH
        });

        ap.call('restorePullToRefresh');
      }, false);
    }

    checkType(item = {}, type) {
      let { appContentItemVO = {} } = item;
      let { contentType } = appContentItemVO;

      return contentType === type;
    }

    checkItIsVideo(item = {}) {
      let { appContentItemVO = {} } = item;
      let { contentType } = appContentItemVO;

      return (contentType === 'video' || contentType === 'shortVideo');
    }

    mounted () {
      this.initPage({
        feedsType: USER_BEHAVE_TYPE.HOME
      });

      // 红点消除
      // https://yuque.antfin-inc.com/alipaysocialteam/apidocs/fo705q#6kb3mr
      ap.call('APSocialNebulaPlugin.queryRecentStatusExternal', {
        itemType: '111',
        itemId: '111001'
      }, function (res) {
        ap.call('APSocialNebulaPlugin.updateRecentListExternal', {
          ...res,
          unread: 0
        });
      });

      // pageMonitor
      reportPV({
        spmId: 'a68.b8236'
      });
    }
  }

  export default TalentBox;
</script>
