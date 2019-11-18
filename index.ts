import { createConnection } from "net";
import * as request from "request-promise-native";
import * as config from "./config.json";

export async function encode(text: any) {
    return Buffer.from(text).toString('base64')
}

export async function createPacket(packet: any, type: number = 255, cmd: number = 255) {
    packet: any = Buffer.from(packet);
    const array: Array<any> = Buffer.alloc(packet.length + 2);
    array[0] = type;
    array[1] = cmd;
    packet.copy(array, 2);
    return encryption(array);
  }

export async function encryption(packet: any) {
    if (typeof packet === 'string') packet = Buffer.from(packet, 'binary');
    const array = Buffer.from([250, 158, 179]);

    for (let i = 0; i < packet.length; i++) {
      if (packet[i] !== array[i % array.length]) {
        packet[i] ^= array[i % array.length];
      }
    }
    return packet;
  }

class CreateBots {
    email: string;
    password: string;
    socket: any;
    
    constructor(_email: string, _password: string) {
        this.email = _email;
        this.password = _password;
        this.socket = null;
    }

    async login(email: string, password: string) {
        const form: Object<string> = {
          email: encode(this.email),
          password: encode(this.password),
          clientId: 9999,
          buildPlatform: 3,
        };

        const response: any = await request.post({
          url: 'https://game.aq3d.com/api/Game/LoginAQ3D',
          form,
          json: true,
        });

        const { strToken, chars } = response.Account;
        let token: any = strToken;
        let id: any = chars[0].ID;

        this.connect(token, id)
      }

    connect(token, id) {
        const serverRemote = 'bluedragon.aq3d.com';
        const serverPort = 5590;
        this.socket = createConnection({ host: serverRemote, port: serverPort}, () => {
          console.log('Connected!');
          this.socket.setEncoding('binary');
          this.write({ id, token, type: 3, cmd: 1 })
             setInterval(() => {
                     this.write({ charID: config.ID, link: config.join, type: 29, cmd: 6 });
                      this.write({ em: 12, type: 21, cmd: 255 });
                      this.write({ ID: 5, spellTemplateID: 12, targetIDs: [], targetTypes: [], type: 12, cmd: 1 });
                }, 1000);
              });



        this.socket.on('data', data => console.log(encryption(data).toString()));
        this.socket.on('error', () => {
          console.log("Error");
        })
      }

      write(packet) {
        console.log(`Sending ${packet}`);
        const toPacket = createPacket(JSON.stringify(packet), packet.type, packet.cmd);
        this.socket.write(toPacket);
        this.socket.write('\x00');
      }
}



const fs = require('fs');
const path = require('path');

fs.readFileSync(path.join(__dirname, '.', 'accountsOne.txt'), { encoding: 'utf-8' }).trim()
.split('\r\n')
.filter(proxy => proxy.includes(':'))
.forEach(account => {
  const [email, password] = account.split(':');
  new CreateBots(email, password).login()
});
