declare module "html5-qrcode" {
  export class Html5QrcodeScanner {
    constructor(
      elementId: string,
      config: {
        qrbox?: {
          width: number;
          height: number;
        };
        fps?: number;
        aspectRatio?: number;
        supportedScanTypes?: any[];
      },
      verbose?: boolean
    );

    render(
      onScanSuccess: (decodedText: string, decodedResult: any) => void,
      onScanError: (error: any) => void
    ): void;

    clear(): Promise<void>;
  }

  export class Html5Qrcode {
    constructor(elementId: string);

    start(
      cameraIdOrConfig:
        | string
        | {
            deviceId?: { exact: string };
            facingMode?: string;
            fps?: number;
            qrbox?: {
              width: number;
              height: number;
            };
            aspectRatio?: number;
            supportedScanTypes?: any[];
          },
      onScanSuccess: (decodedText: string, decodedResult: any) => void,
      onScanError: (error: any) => void
    ): Promise<void>;

    stop(): Promise<void>;
  }
}
