# AnnotateWeb Plugin

引入方式：

```html
<script>
  window.AnnotateWebConfig = {
    siteId: "bowang-law",
    apiBase: "https://annotate.lnlxkj.com",
    pageKey: location.pathname,
    autoLoad: true,
    autosave: true,
    requireAnnotator: true,
    showShare: false,
    showInvite: false
  };
</script>
<script src="https://annotate.lnlxkj.com/plugin/html2canvas.min.js?v=20260623-ui2"></script>
<script src="https://annotate.lnlxkj.com/plugin/annotateweb.js?v=20260623-ui2"></script>
```

`siteId` 用于区分不同网站，`pageKey` 用于区分同一网站的不同页面。

## 使用说明

1. 首次打开会提示填写标注者姓名或昵称，之后每条标注都会记录创建者。
2. 选择鼠标箭头图标可以正常浏览页面。
3. 选择画笔、高亮、直线、矩形、圆形或文字工具后，可直接在页面上标注。
4. 标注完成后会自动保存，也可以点击工具窗口里的“保存”按钮手动保存。
5. 刷新页面后，当前页面的标注会自动加载，其他访问者也能看到标注者姓名。
6. 按住工具窗口边缘、顶部区域或拖拽把手可以移动窗口。
