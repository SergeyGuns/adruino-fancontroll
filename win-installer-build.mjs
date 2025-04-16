import electronInstaller from 'electron-winstaller';
try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: './adruino-fancontroll-win32-x64',
      outputDirectory: './dist/installer64',
      authors: 'My App Inc.',
      exe: 'adruino-fancontroll.exe'
    });
    console.log('It worked!');
  } catch (e) {
    console.log(`No dice: ${e.message}`);
  }