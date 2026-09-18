import Antd from 'antdv-next'

/** 全量注册 antdv-next（管理端 CSR 为主，C 端仅弹窗等基础组件使用） */
export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(Antd)
})
