/* tslint:disable no-any no-submodule-imports */
import { CombinedVueInstance } from 'vue/types/vue'
import VueRouter, { Route } from 'vue-router'
import { Store } from 'vuex'

export interface BlomVuexAsyncDataProps<P> {
  store: Store<P>
  route: Route
}

export type BlomVuexAsyncData<P> = (
  props: BlomVuexAsyncDataProps<P>
) => void | Promise<void>

export type BlomAsyncData<P> = BlomVuexAsyncData<P>

export interface BlomCreateAppReturn {
  router: VueRouter
  app: CombinedVueInstance<any, any, any, any, any>
  store: any
}

export type BlomCreateApp = () => BlomCreateAppReturn
