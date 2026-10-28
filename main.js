/* ============================================================
   main.js —— 启点图书 首页脚本（第 4–5 次课）
   三层分离：HTML 是骨架、CSS 是皮肤、JS 是让页面「会做事」的大脑
   所有交互都按同一个三步法写：找元素 → 绑事件 → 改状态
   第 5 次课升级：页面内容由 books 数据渲染——数据是唯一真相，
   HTML 只是数据的投影。
   ============================================================ */

console.log("你好，JS！启点图书的脚本已加载");   // 按 F12 → Console 能看到

/* ---------- 案例 A：暗色模式（第 4 次课） ----------
   思路：JS 不逐个改颜色（太累），只在 body 上切一个类名；
   颜色变化全部交给 CSS 里的 body.dark 变量覆盖——各干各的。 */

// 1. 找元素：用 CSS 选择器锁定按钮
const modeBtn = document.querySelector("#modeBtn");

// 2. 绑事件：谁（modeBtn）+ 什么动作（click）+ 干什么（函数）
modeBtn.addEventListener("click", function () {
  // 3. 改状态：toggle = 有 dark 类就移除，没有就添加（开关灯）
  document.body.classList.toggle("dark");

  // 顺手同步按钮文字，并告知无障碍设备当前状态
  const isDark = document.body.classList.contains("dark");
  modeBtn.textContent = isDark ? "☀️ 亮色" : "🌙 暗色";
  modeBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
});

/* ---------- 动手②：回到顶部按钮（第 4 次课） ----------
   CSS 用 position: fixed 把它钉在右下角；
   JS 只做一件事：点击后滚回页面最上方。 */

const topBtn = document.querySelector("#topBtn");

topBtn.addEventListener("click", function () {
  window.scrollTo(0, 0);   // 横向 0、纵向 0，一次到位
});

/* ---------- 案例 B：购物车计数器（第 4 次课） ----------
   记住这个模式：状态 → 页面。
   数字显示在页面上，但真相存在变量 count 里；
   每次点击：先改 count，再让页面追上 count。 */

let count = 0;                                   // 状态：加了几本
const cart = document.querySelector("#cart");    // 页面上的显示位

// 绑定函数单独封装：每次重新渲染后，按钮是「新」的，要重新绑
function bindAddButtons() {
  // querySelectorAll 拿到的是「一组」按钮，要挨个绑事件
  document.querySelectorAll(".addBtn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      count = count + 1;                           // 先改状态
      cart.textContent = "购物车 (" + count + ")"; // 再让页面追上
    });
  });
}

/* ---------- 渲染三步套路（第 5 次课） ----------
   ① 备一个空字符串  ② 每本书拼一段  ③ 一次性 innerHTML 灌入
   为什么最后一次性灌入？循环里每 innerHTML 一次浏览器就重排一次，
   先拼完再一次赋值，只动一次 DOM——习惯从现在养成。 */

const cardsBox = document.querySelector(".cards");   // 书卡容器

function render(list) {
  // 空结果也是一种状态：搜不到时给句话，别让页面白着
  if (list.length === 0) {
    cardsBox.innerHTML = "<p class='empty'>没有找到相关图书</p>";
    return;   // 提前结束，后面的拼接不再执行
  }

  let html = "";                                       // ① 备一个空字符串
  list.forEach(function (b) {                          // ② 每本书拼一段
    // 加分项：isNew 拼「新书」角标，inStock 决定按钮还是「暂无库存」
    const badge = b.isNew ? "<span class='badge-new'>新书</span>" : "";
    const action = b.inStock
      ? "<button class='addBtn add-cart' type='button'>加入购物车</button>"
      : "<p class='stock-out'>暂无库存</p>";
    // 双引号套单引号，是拼 HTML 字符串的固定套路
    html = html + "<article class='book-card'>" + badge +
      "<div class='cover' aria-hidden='true'>封面图</div>" +
      "<div class='info'>" +
      "<h3 class='book-title'>" + b.title + "</h3>" +
      "<p class='book-author'>" + b.author + "</p>" +
      // Number() 兜一层：万一价格被写成字符串 "19.00"，toFixed 会报错、整页画不出来
      "<p class='book-price'>¥" + Number(b.price).toFixed(2) + "</p>" +
      action +
      "</div></article>";
  });
  cardsBox.innerHTML = html;                           // ③ 一次性灌入
  bindAddButtons();   // 新卡片刚出生，购物车按钮要重新绑一遍
}

/* ---------- 数据 + 一个「数据到没到」的开关 ----------
   books 装书单，dataReady 装状态。
   为什么还要开关？搜索监听器已经搬到 fetch 外面、全天候待命，
   它必须先问一句「现在有数据可筛吗」，否则会拿空数组去渲染，
   把页面刷成「没有找到相关图书」——那是在撒谎。 */

let books = [];          // 接口数据到手前的空数组
let dataReady = false;   // false = 还没拿到数据（或加载失败）

/* ---------- 三个表单元素，先找好，只找一次 ---------- */

const keywordInput = document.querySelector("#keyword");      // 关键字输入框
const categorySelect = document.querySelector("#category");    // 分类下拉框
const searchForm = document.querySelector("#search-form");     // 整个表单

/* ---------- 过滤：全页唯一的「算结果」入口 ----------
   input、change、submit 三处用的是同一套规则，
   抽成一个函数，就不会出现「改了这处忘了那处」。
   参数不用传：两个控件的值在函数里现读，永远是最新的。 */

function applyFilter() {
  // 守门：数据没到手就什么都不做，页面保持原样
  if (dataReady === false) {
    return;
  }

  const kw = keywordInput.value;            // 关键字原样用（本课不教 trim / toLowerCase）
  const category = categorySelect.value;    // all / scifi / literature / mystery

  // filter = 安检门：函数返回 true 的书放行，返回一个新数组
  const result = books.filter(function (b) {
    // 书名命中 或 作者命中，都算命中；kw 是 "" 时 includes 对谁都返回 true
    const matchKeyword = b.title.includes(kw) || b.author.includes(kw);
    // 选「全部」时这一关永远放行；否则要求书上的 category 与下拉框的值一致
    const matchCategory = category === "all" || b.category === category;
    return matchKeyword && matchCategory;   // 两关都过才留下
  });

  render(result);
}

/* ---------- 三个监听器：全部写在 fetch 外面 ----------
   老写法把监听器塞进 then，等于把「绑事件」和「拿数据」绑死：
   接口一失败，then 根本不执行，监听器永远绑不上，输入框成摆设。
   现在先绑好，数据好坏都能用。 */

// ① input：边打边搜，每敲一个字符（含删除）都触发
keywordInput.addEventListener("input", function () {
  applyFilter();
});

// ② change：下拉框的值真的变了才触发
categorySelect.addEventListener("change", function () {
  applyFilter();
});

// ③ submit：按回车、点「检索」，都走这里
searchForm.addEventListener("submit", function (event) {
  // 表单默认提交 = 把地址改成 ?keyword=… 并整页刷新，
  // 刷新后所有 JS 变量重来——购物车归零、筛选状态全丢。
  // preventDefault() 就是告诉浏览器「这次别刷新」。
  event.preventDefault();
  applyFilter();   // 拦住之后补一次过滤：手动点「检索」也该立刻出结果
});

/* ---------- fetch 接口版（第 5 次课） ----------
   书单不再写死在 JS 里，而是从 books.json 拿——
   就像点外卖：发请求 → 服务器打包 → 拆餐盒（res.json()）→ 开吃（render）。
   异步铁律：要用接口数据的代码，必须写进 then 里。 */

fetch("books.json")                                  // ① 发请求
  .then(function (res) {
    return res.json();                               // ② 拆餐盒：文本转 JS 数据
  })
  .then(function (data) {
    books = data;                                    // ③ 数据到手，存起来
    dataReady = true;                                // ④ 先开开关，再调用过滤
    applyFilter();                                   // ⑤ 按当前输入渲染（空框 → 全部）
  })
  .catch(function (error) {
    // catch 是整条链的「兜底网」：上面任何一步出错（断网、路径写错、
    // JSON 写坏）都会跳过剩下的 then，直接掉进这里。
    // 位置必须放最后——写在中间，它后面那一步的错误就兜不住了。
    // 文案要和「没有找到相关图书」区分开：一个是没加载上，一个是真没搜到。
    cardsBox.innerHTML = "<p class='empty'>书单加载失败，请检查网络或 books.json 路径后刷新页面</p>";
    console.log("books.json 加载失败：", error);      // F12 → Console 里能看到真正的原因
    // dataReady 保持 false：此后输入关键字会被守门挡住，这句提示不会被冲掉
  });
