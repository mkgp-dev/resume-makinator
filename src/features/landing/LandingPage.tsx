import { Box, Button, Container, Flex, Group, Stack, Text, Title, Badge, SimpleGrid } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { IconChevronRight, IconSparkles, IconDatabase, IconFileCheck, IconBrandGithub, IconFolder } from '@tabler/icons-react'
import { motion, type Variants } from 'framer-motion'

import { useResumeDocumentsStore } from '@/entities/resume/store'

// --- Framer Motion Configurations ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
}

const matrixContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
}

const matrixCardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
}

export function LandingPage() {
  const navigate = useNavigate()
  const createDocument = useResumeDocumentsStore((state) => state.createDocument)

  const handleStartBuilding = async () => {
    await createDocument()
    await navigate({ to: '/builder' })
  }

  return (
    <Box 
      style={{ 
        height: '100vh',         // STRICT NO-SCROLL
        width: '100vw',
        overflow: 'hidden',      // STRICT NO-SCROLL
        position: 'relative',
        backgroundColor: 'var(--mantine-color-body)',
        display: 'flex',
        alignItems: 'center',    // PERFECT VERTICAL CENTER
        justifyContent: 'center' // PERFECT HORIZONTAL CENTER
      }}
    >
      {/* Ambient Grid Background */}
      <Box 
        style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(var(--mantine-color-default-border) 1px, transparent 1px), linear-gradient(90deg, var(--mantine-color-default-border) 1px, transparent 1px)`,
          backgroundSize: '40px 40px', opacity: 0.4,
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 50%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 50%, transparent 80%)'
        }}
      />

      <Container size="xl" w="100%" style={{ position: 'relative', zIndex: 1 }}>
        <Flex direction="column" align="center" justify="center" gap={{ base: 40, md: 64 }}>
          
          {/* CENTERED HERO */}
          <Stack gap={20} align="center" ta="center" maw={720}>
            <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

              <motion.div variants={itemVariants}>
                <Title 
                  order={1} 
                  style={{ lineHeight: 1.05, letterSpacing: '-0.03em' }} 
                  fz={{ base: 40, sm: 56, md: 64 }} 
                  fw={500}
                >
                  This is <br/>
                  <Text component="span" c="teal.6" inherit>Resume Makinator</Text>
                </Title>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Text size="lg" c="dimmed" style={{ maxWidth: 600, lineHeight: 1.6 }}>
                  Stop fighting formatting. Write your raw experience and let our local-first AI engine compile it into a pixel-perfect, ATS-optimized document.
                </Text>
              </motion.div>

              <motion.div variants={itemVariants} style={{ marginTop: '8px' }}>
                <Group gap={16} justify="center">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={handleStartBuilding} 
                      size="lg" 
                      h={50} 
                      px={32}
                      radius="sm"
                      color="dark"
                      rightSection={<IconChevronRight size={18} />}
                      style={{ boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.12)' }}
                    >
                      Initialize Workspace
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="default"
                      component="a"
                      href="https://github.com/mkgp-dev/resume-makinator" // Link to your repo
                      target="_blank"
                      size="lg" 
                      h={50} 
                      px={32}
                      radius="sm"
                      leftSection={<IconBrandGithub size={18} />}
                    >
                      View Source
                    </Button>
                  </motion.div>
                </Group>
              </motion.div>

            </motion.div>
          </Stack>

          {/* CODEBASE CAPABILITY MATRIX */}
          <Box w="100%" maw={1100}>
            <motion.div variants={matrixContainerVariants} initial="hidden" animate="show">
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing={20}>
                
                {/* Feature 1: Chat Assistant */}
                <motion.div variants={matrixCardVariants} whileHover={{ y: -4 }}>
                  <Box 
                    p={24} h="100%"
                    style={{ 
                      backgroundColor: 'var(--mantine-color-body)',
                      border: '1px solid var(--mantine-color-default-border)',
                      borderRadius: 'var(--mantine-radius-sm)',
                      boxShadow: 'var(--mantine-shadow-sm)',
                      transition: 'border-color 0.2s ease' 
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--mantine-color-teal-6)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--mantine-color-default-border)'}
                  >
                    <Stack gap={16}>
                      <Group justify="space-between">
                        <Badge variant="outline" color="gray" radius="sm" leftSection={<IconFolder size={10} />} style={{ textTransform: 'none', fontFamily: 'var(--mantine-font-family-monospace)' }}>
                          /src/features/chat-assistant
                        </Badge>
                        <IconSparkles size={18} className="mantine-text-teal-6" />
                      </Group>
                      <Box>
                        <Text fw={600} fz={16} mb={4}>Context-Aware Copilot</Text>
                        <Text size="sm" c="dimmed" lh={1.5}>
                          Powered by <Text component="span" ff="monospace" fz="xs" c="dark">useChatAssistantStore</Text>. Chat directly with your draft and apply AI-optimized metrics directly to the Editor state.
                        </Text>
                      </Box>
                    </Stack>
                  </Box>
                </motion.div>

                {/* Feature 2: PDF Compilation */}
                <motion.div variants={matrixCardVariants} whileHover={{ y: -4 }}>
                  <Box 
                    p={24} h="100%"
                    style={{ 
                      backgroundColor: 'var(--mantine-color-body)',
                      border: '1px solid var(--mantine-color-default-border)',
                      borderRadius: 'var(--mantine-radius-sm)',
                      boxShadow: 'var(--mantine-shadow-sm)',
                      transition: 'border-color 0.2s ease' 
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--mantine-color-teal-6)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--mantine-color-default-border)'}
                  >
                    <Stack gap={16}>
                      <Group justify="space-between">
                        <Badge variant="outline" color="gray" radius="sm" leftSection={<IconFolder size={10} />} style={{ textTransform: 'none', fontFamily: 'var(--mantine-font-family-monospace)' }}>
                          /src/features/resume-preview
                        </Badge>
                        <IconFileCheck size={18} className="mantine-text-dark-filled" />
                      </Group>
                      <Box>
                        <Text fw={600} fz={16} mb={4}>Live PDF Compilation</Text>
                        <Text size="sm" c="dimmed" lh={1.5}>
                          Zero-latency rendering via <Text component="span" ff="monospace" fz="xs" c="dark">WhitepaperTemplate.tsx</Text>. Guaranteed ATS precision with custom registered fonts and exact geometric spacing.
                        </Text>
                      </Box>
                    </Stack>
                  </Box>
                </motion.div>

                {/* Feature 3: IndexedDB Autosave */}
                <motion.div variants={matrixCardVariants} whileHover={{ y: -4 }}>
                  <Box 
                    p={24} h="100%"
                    style={{ 
                      backgroundColor: 'var(--mantine-color-body)',
                      border: '1px solid var(--mantine-color-default-border)',
                      borderRadius: 'var(--mantine-radius-sm)',
                      boxShadow: 'var(--mantine-shadow-sm)',
                      transition: 'border-color 0.2s ease' 
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--mantine-color-teal-6)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--mantine-color-default-border)'}
                  >
                    <Stack gap={16}>
                      <Group justify="space-between">
                        <Badge variant="outline" color="gray" radius="sm" leftSection={<IconFolder size={10} />} style={{ textTransform: 'none', fontFamily: 'var(--mantine-font-family-monospace)' }}>
                          /src/shared/lib/db
                        </Badge>
                        <IconDatabase size={18} className="mantine-text-dark-filled" />
                      </Group>
                      <Box>
                        <Text fw={600} fz={16} mb={4}>Absolute Sovereignty</Text>
                        <Text size="sm" c="dimmed" lh={1.5}>
                          Your data never leaves your machine. Handled seamlessly by <Text component="span" ff="monospace" fz="xs" c="dark">app-db.ts</Text> and <Text component="span" ff="monospace" fz="xs" c="dark">useAutosaveStore</Text> using strictly local IndexedDB.
                        </Text>
                      </Box>
                    </Stack>
                  </Box>
                </motion.div>

              </SimpleGrid>
            </motion.div>
          </Box>

        </Flex>
      </Container>
    </Box>
  )
}