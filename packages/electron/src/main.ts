import { app, BrowserWindow, shell, Menu } from 'electron'
import { spawn, ChildProcess } from 'child_process'
import * as path from 'path'
import * as http from 'http'

const isDev = process.env.NODE_ENV === 'development'
const SERVER_PORT = 3001
const CLIENT_PORT = 3000
const SERVER_READY_TIMEOUT = 20_000

let serverProcess: ChildProcess | null = null
let mainWindow: BrowserWindow | null = null

function startServer(): void {
  const serverDir = path.resolve(__dirname, '../../server')
  serverProcess = spawn('bun', ['run', 'src/index.ts'], {
    cwd: serverDir,
    env: {
      ...process.env,
      PORT: String(SERVER_PORT),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  serverProcess.stdout?.on('data', (d: Buffer) => process.stdout.write(`[server] ${d}`))
  serverProcess.stderr?.on('data', (d: Buffer) => process.stderr.write(`[server] ${d}`))
  serverProcess.on('error', (err) => console.error('Server process error:', err))
  serverProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) console.error(`Server exited with code ${code}`)
  })
}

function waitForServer(port: number, timeout: number): Promise<void> {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      if (Date.now() - start > timeout) {
        return reject(new Error(`Server did not start within ${timeout}ms`))
      }
      const req = http.get(`http://localhost:${port}/health`, (res) => {
        if (res.statusCode === 200) resolve()
        else setTimeout(check, 500)
      })
      req.on('error', () => setTimeout(check, 500))
      req.end()
    }
    check()
  })
}

function buildMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Inquire',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        ...(isDev ? [{ role: 'toggleDevTools' as const }] : []),
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#1a1a1e',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  const url = isDev
    ? `http://localhost:${CLIENT_PORT}`
    : `http://localhost:${SERVER_PORT}`

  mainWindow.loadURL(url)

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    if (isDev) mainWindow?.webContents.openDevTools()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    shell.openExternal(targetUrl)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(async () => {
  buildMenu()

  if (!isDev) {
    startServer()
    try {
      await waitForServer(SERVER_PORT, SERVER_READY_TIMEOUT)
    } catch (err) {
      console.error('Server failed to start:', err)
    }
  }

  await createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill()
    serverProcess = null
  }
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  serverProcess?.kill()
})
