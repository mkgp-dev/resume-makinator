import { render } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { act } from 'react'
import type { ComponentType } from 'react'

import { AppProviders } from '@/app/providers/AppProviders'

export async function renderWithRouter(component: ComponentType, path = '/') {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  })

  const route = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => {
      const Component = component
      return <Component />
    },
  })

  const builderRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/builder',
    component: () => <div>Builder Test Route</div>,
  })

  const routeTree = rootRoute.addChildren([route, builderRoute])

  const testRouter = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  })

  const view = render(
    <AppProviders>
      <RouterProvider router={testRouter} />
    </AppProviders>,
  )

  await act(async () => {
    await testRouter.load()
  })

  return { ...view, router: testRouter }
}
