var reviewVue = new Vue({
  el: '#app',
  data: {
    dataList: [],
    stats: { pending: 0, inReview: 0, resolved: 0 }
  },
  methods: {
    updateField: function(item, field, value) {
      item[field] = value;
    },
    saveReview: function(item) {
      var payload = Object.assign({}, item, {
        reviewedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      });
      layui.http.requestJson('messages/update', 'post', payload, function() {
        var statusNode = document.getElementById('reviewBoardStatus');
        if (statusNode) statusNode.textContent = '已保存处理结果：' + (payload.handleStatus || 'PENDING');
        if (window.AccessibilityUtils) {
          AccessibilityUtils.announce('反馈处理已保存');
        }
        loadReviewList();
      });
    }
  }
});

function recountFeedback(items) {
  var stats = { pending: 0, inReview: 0, resolved: 0 };
  items.forEach(function(item) {
    if ((item.handleStatus || 'PENDING') === 'RESOLVED') stats.resolved += 1;
    else if ((item.handleStatus || 'PENDING') === 'IN_REVIEW') stats.inReview += 1;
    else stats.pending += 1;
  });
  reviewVue.stats = stats;
}

function loadReviewList() {
  layui.http.request('messages/list', 'get', { page: 1, limit: 20, sort: 'addtime', order: 'desc' }, function(res) {
    reviewVue.dataList = (res.data && res.data.list) ? res.data.list : [];
    recountFeedback(reviewVue.dataList);
    var statusNode = document.getElementById('reviewBoardStatus');
    if (statusNode) statusNode.textContent = '已加载 ' + reviewVue.dataList.length + ' 条反馈记录';
  }, {
    silentError: true,
    onError: function() {
      reviewVue.dataList = [];
      recountFeedback([]);
      var statusNode = document.getElementById('reviewBoardStatus');
      if (statusNode) statusNode.textContent = '反馈看板加载失败，请稍后重试';
    }
  });
}

layui.use(['http'], function() {
  loadReviewList();
});
