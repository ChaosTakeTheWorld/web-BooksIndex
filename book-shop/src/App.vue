<script setup>
/* ============================================================
   App.vue —— 启点图书 Vue 版（第 6 次课）
   本课只动这一个文件：
     · 老 index.html 的 <body> 内部结构，剪进下面的 <template>
     · 老 main.js 里「拼字符串」的卡片，换成 v-for 自动生成
     · 老 main.js 里的 count 变量，换成 ref，点一下数字自己变
     · 第 4 次课的暗色按钮与回到顶部，也一并搬回来
   组件化与 v-model 是第 7 次课，本次不做。
   ============================================================ */

// P13：ref 是给数据装「监视器」。
// 脚本里读写要带 .value；template 里 Vue 自动拆盒，不用写。
import { ref } from "vue";

// P17 案例 A：老 style.css 原样复制到 src/ 后，在这里引入一次。
// 这一行顶替了老 index.html 里的 <link href="style.css">；
// 它没有 scoped，所以 html / body 那层的全局规则照样生效。
import "./style.css";

// P20 动手②第 1 步：书单搬进 ref。
// 字段沿用 books.json：title / author / category / price / inStock / isNew
const books = ref([
  { title: "山", author: "刘慈欣", category: "scifi", price: 19.0, inStock: true, isNew: true },
  { title: "生死疲劳", author: "莫言", category: "literature", price: 29.0, inStock: true, isNew: false },
  { title: "银河帝国", author: "艾萨克·阿西莫夫", category: "scifi", price: 48.0, inStock: true, isNew: true },
  { title: "嫌疑人X的献身", author: "东野圭吾", category: "mystery", price: 35.0, inStock: false, isNew: false },
  { title: "龙与少年游", author: "江南", category: "literature", price: 25.0, inStock: true, isNew: false },
  { title: "死在火星上", author: "天瑞说符", category: "scifi", price: 45.0, inStock: true, isNew: false },
]);

// P18 案例 B：购物车计数器。
// 真相只有 count 一个 ref，页面上那个数字只是它的投影——
// 不再有「先改变量、再手动改页面文字」两步。
const count = ref(0);

// 第 4 次课：暗色模式（本次补回）。
// 思路和原生版一样——JS 只切一个类名，颜色全部交给 style.css 里的 body.dark 覆盖。
// 注意：主题类必须挂在 <body> 上（样式写的是 body.dark { … }），
// 而 <body> 在 Vue 的挂载点 #app 外面，所以这一步是直接改它。
// 这是本页唯一一处「DOM 操作」，其余显示全部由数据驱动。
const isDark = ref(false);

function toggleTheme() {
  isDark.value = !isDark.value;   // 先改状态
  // 第二个参数是「强制设为这个状态」：true 就加、false 就删，
  // 比先判断再 add/remove 少两行，也不会出现类名和状态对不上的情况
  document.body.classList.toggle("dark", isDark.value);
}

// 回到顶部：第 4 次课的按钮，Vue 里只需改数据之外的一个调用。
// 注意不能写成模板里的 @click="window.scrollTo(0, 0)"——
// 模板表达式只允许组件自己的变量和少数全局对象，window 不在其中。
function backTop() {
  window.scrollTo(0, 0);
}
</script>

<template>
  <!-- P17 案例 A：老 index.html 的 <body> 内部结构整体剪进来。
       不写 <body>（挂载点在 index.html 的 #app），
       不写 <link>（样式已 import），不写 <script src=main.js>（逻辑就是这个 .vue 文件）。 -->
  <header class="site-header">
    <div class="header-inner">
      <div class="brand">
        <span class="logo" aria-hidden="true">📚</span>
        <h1>启点图书</h1>
      </div>
      <div class="header-actions">
        <nav class="site-nav" aria-label="主导航">
          <a class="active" href="#" aria-current="page">首页</a>
          <a href="#">检索</a>
          <a href="#">分类</a>
          <a href="#">关于</a>
        </nav>

        <!-- P13 插值 {{ }}：把 ref 的值写进页面。
             count 是 ref，模板里不写 .value —— Vue 自动拆盒。
             这一行就是 P18 案例 B 的「显示端」。 -->
        <span class="cart">购物车 ({{ count }})</span>

        <!-- 第 4 次课的暗色按钮，本次补回。
             两个 v-bind 的用法：
               :aria-pressed  —— 把 isDark 绑到无障碍属性上，读屏器才知道当前是暗是亮；
               {{ }} 里的三元 —— 按钮文字跟着状态换，不用手动改 textContent。
             @click 只写方法名，不带括号。 -->
        <button
          class="btn-icon"
          type="button"
          :aria-pressed="isDark ? 'true' : 'false'"
          @click="toggleTheme"
        >
          {{ isDark ? "☀️ 亮色" : "🌙 暗色" }}
        </button>
      </div>
    </div>
  </header>

  <div class="layout">
    <main class="content">
      <!-- 检索区 .search-panel 本次不搬：
           没有 v-model 之前，输入了也不会有结果。
           第 7 次课学完 v-model 再原样加回来。 -->
      <section class="book-list" aria-labelledby="new-books-title">
        <h2 class="section-title" id="new-books-title">全部图书</h2>

        <div class="cards">
          <!-- P14 v-for：六本书一次说完。
               :key="b.title" 给每张卡发身份证，数据一变 Vue 才知道
               是哪一张动了，而不是六张全部重画。
               注意：v-if 不能和 v-for 写在同一个元素上（Vue 3 里 v-if 优先级更高，
               会拿不到 b 而报错），所以下面的条件都落在子节点。 -->
          <article v-for="b in books" :key="b.title" class="book-card">
            <!-- P14 v-if：isNew 为真，角标才出现 -->
            <span v-if="b.isNew" class="badge-new">新书</span>

            <div class="cover" aria-hidden="true">封面图</div>

            <div class="info">
              <h3 class="book-title">{{ b.title }}</h3>
              <!-- 作者前的冒号由 style.css 的 .book-author::before 补，CSS 一行没改 -->
              <p class="book-author">{{ b.author }}</p>
              <!-- toFixed(2)：19 显示成 19.00，与老版 render() 的输出一致 -->
              <p class="book-price">¥{{ b.price.toFixed(2) }}</p>

              <!-- P23 作业②：v-if / v-else 二选一。
                   有货给按钮，没货给一句话——两段都复用老 CSS。 -->
              <button
                v-if="b.inStock"
                class="add-cart"
                type="button"
                @click="count++"
              >
                加入购物车
              </button>
              <p v-else class="stock-out">暂无库存</p>
            </div>
          </article>
        </div>
      </section>
    </main>

    <!-- 侧栏三个面板：纯静态结构，原样搬。
         section 上的 id 去掉了，但 h3 的 id 必须留——上面的 aria-labelledby 正指着它们。 -->
    <aside class="sidebar">
      <section class="panel" aria-labelledby="categories-title">
        <h3 id="categories-title">图书分类</h3>
        <ul>
          <li><a href="#">文学小说</a></li>
          <li><a href="#">科幻悬疑</a></li>
          <li><a href="#">历史传记</a></li>
          <li><a href="#">经管励志</a></li>
          <li><a href="#">少儿读物</a></li>
          <li><a href="#">艺术设计</a></li>
        </ul>
      </section>

      <section class="panel" aria-labelledby="weekly-hot-title">
        <h3 id="weekly-hot-title">本周热榜</h3>
        <ol>
          <li><a href="#">山</a></li>
          <li><a href="#">生死疲劳</a></li>
          <li><a href="#">银河帝国</a></li>
          <li><a href="#">嫌疑人X的献身</a></li>
          <li><a href="#">龙与少年游</a></li>
        </ol>
      </section>

      <section class="panel" aria-labelledby="borrow-notice-title">
        <h3 id="borrow-notice-title">借阅须知</h3>
        <ul>
          <li>借期 30 天，可续借 1 次</li>
          <li>逾期每天 0.2 元</li>
          <li>凭校园卡到馆取书</li>
        </ul>
      </section>
    </aside>
  </div>

  <!-- 回到顶部：第 4 次课的 fixed 按钮。@click 后面写组件自己的方法名，不带括号 -->
  <button class="top-btn" type="button" @click="backTop">回到顶部 ↑</button>

  <footer class="site-footer">
    <p>© 2026 启点图书 · 联系:contact@qidian.example · 仅供课程作业演示</p>
  </footer>
</template>
