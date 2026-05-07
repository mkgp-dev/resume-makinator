import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router'

import { RouteErrorState, RoutePendingState } from '@/app/router/RouteStates'
import { ensureBuilderHasActiveResume, shouldRedirectLandingToBuilder } from '@/app/router/router-init'
import { BuilderShell } from '@/app/shell/BuilderShell'
import { LandingPage } from '@/features/landing/LandingPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async () => {
    if (await shouldRedirectLandingToBuilder()) {
      throw redirect({ to: '/builder' })
    }
  },
  component: LandingPage,
})

const builderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/builder',
  beforeLoad: async () => {
    await ensureBuilderHasActiveResume()
  },
  component: BuilderShell,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

const routeTree = rootRoute.addChildren([landingRoute, builderRoute, settingsRoute])

export const router = createRouter({
  routeTree,
  defaultPendingComponent: RoutePendingState,
  defaultErrorComponent: RouteErrorState,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
