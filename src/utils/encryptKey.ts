import * as crypto from "crypto";

const publicKey="LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0NCk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBekMzTndGajNZMmVYUUdneGhDS08NCkRnVnlYcjllM2lFWUxMNFN4QVJicTNNWHQvYWNTZmV0eHFqYVZyUGgzaGVGN05LVFRyVll2M2c1d0dlNEU1c3cNCmpsS2NDQ0dDNWs1cGpSc1FBbWEwLzEzZWRIMm9mR3dBc2JRT2lFYzMrS2o0TEZsb0xzZzJsZWg0WGtMc2oxU3oNCkRxUWV4Y1FkOHoyOHFJT2dwMFh3L1YxSEVIQTROUi9kMnFLaFVUQnQxSS9aM3cvak5ubGEvd1JVcEJ2dlVqSVMNCkg0cE03UXgxZG1pWk5GYjlTYjQ0dUVtbXJETXJ4VXMwcHhubzh1WWl1OGZpWkVXSHlINDNpUlNSL3RYRldlK3QNCjVKM05zdmp6cUptNHlWOWYwL0JOc0grTndFZ1BGamsrb0J4YmU1UkR4eUxaeVRQekxqLzg5RlJodmRxdUJLODYNClp3SURBUUFCDQotLS0tLUVORCBQVUJMSUMgS0VZLS0tLS0NCg=="

const encryptPassKey = (passKey: string): string => {
    return crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256"
    }
        , Buffer.from(passKey)
    ).toString("base64");
}


export default encryptPassKey 