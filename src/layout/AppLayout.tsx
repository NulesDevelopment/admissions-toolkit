import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import PushPinIcon from '@mui/icons-material/PushPin'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { DRAWER_WIDTH } from '../theme'

const SIDEBAR_PINNED_KEY = 'admissions-toolkit.sidebarPinned'

const navItems = [
  {
    to: '/sprava',
    label: 'Особові справи',
    description: 'Форми Н-2.01 / Н-1.03.1',
    icon: <DescriptionOutlinedIcon />,
  },
  {
    to: '/statystyka',
    label: 'Статистика',
    description: 'Аналіз вступників',
    icon: <BarChartOutlinedIcon />,
  },
] as const

function readPinned(): boolean {
  try {
    const raw = localStorage.getItem(SIDEBAR_PINNED_KEY)
    if (raw == null) return true
    return raw === 'true'
  } catch {
    return true
  }
}

export function AppLayout() {
  const [pinned, setPinned] = useState(readPinned)

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_PINNED_KEY, String(pinned))
    } catch {
      // ignore quota / private mode
    }
  }, [pinned])

  const pinSidebar = () => setPinned(true)
  const unpinSidebar = () => setPinned(false)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="persistent"
        open={pinned}
        sx={{
          width: pinned ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar
          sx={{
            gap: 1,
            px: 1.5,
            justifyContent: 'space-between',
            minHeight: 64,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <SchoolOutlinedIcon color="primary" />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, lineHeight: 1.2 }}
                noWrap
              >
                Admissions Toolkit
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                НУБіП України
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Сховати меню">
            <IconButton
              size="small"
              aria-label="Сховати меню"
              onClick={unpinSidebar}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
        <Divider />
        <List sx={{ px: 1, py: 1.5 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.active': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'inherit' },
                  '& .MuiListItemText-secondary': {
                    color: 'rgba(255,255,255,0.8)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={item.description}
                slotProps={{
                  primary: { sx: { fontWeight: 600, fontSize: 14 } },
                  secondary: { sx: { fontSize: 12 } },
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: pinned ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          bgcolor: 'background.default',
          minHeight: '100vh',
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        {!pinned && (
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1,
              bgcolor: 'background.default',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Tooltip title="Показати й закріпити меню">
              <IconButton
                color="primary"
                aria-label="Показати й закріпити меню"
                onClick={pinSidebar}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <PushPinIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Натисніть, щоб знову закріпити меню
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            p: { xs: 2, md: 3 },
            pb: 8,
            width: '100%',
            maxWidth: pinned ? 1400 : 'none',
            boxSizing: 'border-box',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
