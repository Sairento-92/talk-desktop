; Script generated for Nextcloud Talk Windows Installer
#define MyAppName "Nextcloud Talk"
#define MyAppVersion "2.4.1"
#define MyAppPublisher "Sairento / Nextcloud Talk Community"
#define MyAppURL "https://github.com/Sairento-92/talk-desktop"
#define MyAppExeName "Nextcloud Talk.exe"
#define MySourceDir "out\Nextcloud Talk-win32-x64"

[Setup]
AppId={{94A42407-35FB-4395-B7D4-F8EB6BE98099}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}/releases
DefaultDirName={localappdata}\Programs\NextcloudTalk
DisableDirPage=auto
DisableProgramGroupPage=yes
OutputDir=out
OutputBaseFilename=Nextcloud-Talk-Setup-v2.4.1
SetupIconFile=img\icons\icon.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
CloseApplications=yes
RestartApplications=no
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallDisplayName={#MyAppName}

[Languages]
Name: "polish"; MessagesFile: "compiler:Languages\Polish.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"
Name: "startup"; Description: "Uruchamiaj Nextcloud Talk przy starcie systemu Windows"; GroupDescription: "Autostart:"

[Files]
Source: "{#MySourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userstartup}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: startup

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
