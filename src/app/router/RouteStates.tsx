import { Center, Loader, Stack, Text } from '@mantine/core'

export function RoutePendingState() {
  return (
    <Center mih="100vh">
      <Stack align="center" gap={12}>
        <Loader />
      </Stack>
    </Center>
  )
}

export function RouteErrorState() {
  return (
    <Center mih="100vh">
      <Text>Failed to load. Please refresh.</Text>
    </Center>
  )
}
