// Type definitions for WScript ActiveX objects in HTA applications

interface WScriptShell {
    Run(command: string, windowStyle?: number, waitOnReturn?: boolean): number;
    Popup(text: string, secondsToWait?: number, title?: string, type?: number): number;
    Exec(command: string): any;
    ExpandEnvironmentStrings(str: string): string;
    CurrentDirectory: string;
    Environment(type?: string): any;
    RegRead(name: string): string | number;
    RegWrite(name: string, value: string | number, type?: string): void;
    RegDelete(name: string): void;
    CreateShortcut(path: string): any;
}

interface FileSystemObject {
    CreateTextFile(filename: string, overwrite?: boolean, unicode?: boolean): any;
    OpenTextFile(filename: string, iomode?: number, create?: boolean): any;
    FileExists(path: string): boolean;
    FolderExists(path: string): boolean;
    GetFile(path: string): any;
    GetFolder(path: string): any;
    DeleteFile(path: string, force?: boolean): void;
    DeleteFolder(path: string, force?: boolean): void;
    CopyFile(source: string, destination: string, overwrite?: boolean): void;
    CopyFolder(source: string, destination: string, overwrite?: boolean): void;
    MoveFile(source: string, destination: string): void;
    MoveFolder(source: string, destination: string): void;
    CreateFolder(path: string): any;
    GetAbsolutePathName(path: string): string;
    GetBaseName(path: string): string;
    GetExtensionName(path: string): string;
    GetFileName(path: string): string;
    GetParentFolderName(path: string): string;
}

interface WScriptNetwork {
    UserName: string;
    UserDomain: string;
    ComputerName: string;
    MapNetworkDrive(
        localName: string,
        remoteName: string,
        updateProfile?: boolean,
        user?: string,
        password?: string
    ): void;
    RemoveNetworkDrive(name: string, force?: boolean, updateProfile?: boolean): void;
    EnumNetworkDrives(): any;
    EnumPrinterConnections(): any;
    AddWindowsPrinterConnection(printerPath: string): void;
    RemovePrinterConnection(printerPath: string, force?: boolean, updateProfile?: boolean): void;
    SetDefaultPrinter(printerName: string): void;
}

interface ActiveXObjectConstructor {
    new (progID: "WScript.Shell"): WScriptShell;
    new (progID: "Scripting.FileSystemObject"): FileSystemObject;
    new (progID: "WScript.Network"): WScriptNetwork;
    new (progID: string): any;
}

declare var ActiveXObject: ActiveXObjectConstructor;
