<template>
  <div class="app-container">
    <content-capturer @captured="handleCapture">
      <div class="content">
        <img alt="Vue logo" src="./assets/logo.png">
        <HelloWorld msg="Welcome to Your Vue.js App"/>
        <!-- 测试区域 -->
        <div class="test-area">
          <h2>测试区域</h2>
          <p>你可以在这里测试以下功能：</p>
          <ul>
            <li>使用鼠标选择这段文本 https://example.com </li>
            <li>按住Alt键并移动鼠标到这个列表上</li>
            <li>这是一个包含 <a href="https://example.com">链接</a> 的文本</li>
          </ul>
        </div>
      </div>
    </content-capturer>
    
    <!-- 显示捕获的内容 -->
    <div v-if="capturedContent" class="captured-content">
      <h3>已捕获的内容：</h3>
      <p>类型：{{ capturedContent.type }}</p>
      <p>内容：{{ capturedContent.content }}</p>
      <div v-if="capturedContent.links && capturedContent.links.length">
        <p>发现的链接：</p>
        <ul>
          <li v-for="(link, index) in capturedContent.links" :key="index">
            <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.text }}</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import ContentCapturer from './components/ContentCapturer.vue'

const capturedContent = ref(null)

const handleCapture = (content) => {
  capturedContent.value = content
  console.log('捕获的内容：', content)
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.app-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.content {
  margin-bottom: 40px;
}

.test-area {
  margin-top: 40px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: left;
}

.test-area ul {
  list-style-type: disc;
  padding-left: 20px;
}

.captured-content {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: left;
}

.captured-content ul {
  list-style-type: none;
  padding: 0;
}

.captured-content li {
  margin: 5px 0;
  padding: 5px;
  background-color: #fff;
  border-radius: 4px;
}

.captured-content a {
  color: #2196f3;
  text-decoration: none;
  word-break: break-all;
}

.captured-content a:hover {
  text-decoration: underline;
  color: #1976d2;
}
</style>
