# UI Core

包通过 `@isport/ui-core` 公开导出展示组件，不依赖 Nuxt、应用路由、store 或业务接口。

## 音频播放器

`UiAudioPlayer` 使用 wavesurfer.js 8 渲染真实音频波形。播放器支持播放与暂停、波形拖动与键盘进度条、静音与音量、0.5–2 倍速、从头播放、循环播放和加载失败重试。

```vue
<script setup lang="ts">
import { UiAudioPlayer } from '@isport/ui-core'
</script>

<template>
  <UiAudioPlayer
    src="/audio/lesson.mp3"
    title="教学音频"
    :labels="{ play: '播放', pause: '暂停', seek: '播放进度' }"
    :waveform-options="{ waveColor: '#c6ddfc', progressColor: '#0077fa', barWidth: 4 }"
  />
</template>
```

- `src` 必填；变化时销毁旧实例并取消其加载，晚到的旧事件不会覆盖新音源。
- `title` 为播放器提供可访问名称。
- `labels` 接收 `Partial<AudioPlayerLabels>`；默认英文，应用负责传入当前语言。
- `waveformOptions` 接收公开的 `AudioWaveformOptions`，可配置波形颜色、高度、光标、柱宽、间距、圆角和归一化；媒体实例、宽度、交互和播放状态由组件管理。
- `ready(duration)` 在音频解码完成时触发；`error(error)` 在媒体加载或播放失败时触发。浏览器拒绝播放时可再次点击播放，无需重新加载音源。

组件可直接 SSR，服务端只渲染加载占位和禁用的播放控件。wavesurfer 与媒体加载在挂载后执行，卸载时暂停播放并销毁实例。不会自动播放，也不会发送应用鉴权头。

音频地址必须允许浏览器读取并解码；跨域资源需由资源服务允许 CORS。波形来自真实音频数据，未使用装饰性的随机波形或演示峰值。长音频的解码内存取决于文件大小。

参考：[wavesurfer 选项](https://wavesurfer.xyz/docs/types/wavesurfer.WaveSurferOptions)、[播放器 API](https://wavesurfer.xyz/docs/classes/wavesurfer.default)。
