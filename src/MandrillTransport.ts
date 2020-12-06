import type {Transport} from 'nodemailer';
import type MailMessage from 'nodemailer/lib/mailer/mail-message';
import type {Envelope} from 'nodemailer/lib/mime-node';

import {Requestly} from './services/Requestly';
import {Mandrill} from './models/Mandrill';

export interface Options {
  apiKey: string;
}

export type MandrillResponse = {
  _id: string;
  email: string;
  status: string;
  reject_reason: string | null;
};

export type SentMessageInfo = {
  envelope: Envelope;
  messageId: string;
  message: any;
  response?: MandrillResponse[];
};

export class MandrillTransport implements Transport {

  public name: string = 'MandrillTransport';
  public version: string = 'N/A';

  constructor(private options: Options) {}

  public send(mail: MailMessage, done: (err: Error | null, info?: SentMessageInfo) => void): void {
    setImmediate(() => {
      mail.normalize((error, data) => {
        if (error) return done(error);

        const mandrillData = Mandrill.buildData(data, this.options.apiKey);

        Requestly.postJSON({
          protocol: 'https:',
          hostname: 'mandrillapp.com',
          path: '/api/1.0/messages/send.json'
        }, mandrillData)
          .then((mandrillResponse: MandrillResponse[]) => {
            done(null, {
              envelope: mail.message.getEnvelope(),
              messageId: mail.message.messageId(),
              message: mandrillData.message,
              response: mandrillResponse
            });
          })
          .catch(e => done(e));
      });
    });
  }
}

export default MandrillTransport;
