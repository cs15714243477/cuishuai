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
    showShare: false,
    showInvite: false
  };
</script>
<script src="annotate-plugin/html2canvas.min.js"></script>
<script src="annotate-plugin/annotateweb.js"></script>
```

`siteId` 用于区分不同网站，`pageKey` 用于区分同一网站的不同页面。
