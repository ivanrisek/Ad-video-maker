import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('swangle');
Config.setConcurrency(4);
// Cloud sandbox: use the preinstalled headless shell when present (Remotion's own download host may be blocked).
import fs from 'fs';
const PW_SHELL = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (fs.existsSync(PW_SHELL)) Config.setBrowserExecutable(PW_SHELL);
