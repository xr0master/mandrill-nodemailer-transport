import type {SendMailOptions} from 'nodemailer';
import type {Address} from 'nodemailer/lib/mailer';

const TRANSFORM_FIELDS: object = {
  replyTo: 'Reply-To'
};

const TO_KEYS: To['type'][] = ['to', 'cc', 'bcc'];
const HEADERS = ['replyTo'] as const;

interface To {
  email: string;
  name?: string;
  type?: 'to' | 'cc' | 'bcc';
}

interface Attachments {
  type: string;
  name: string;
  content: string;
}

export namespace Mandrill {

  const getFromName = (data: SendMailOptions): string => {
    if (data.from) {
      return (data.from as Address).name || '';
    }

    return '';
  };

  const getFromAddress = (data: SendMailOptions): string => {
    if (data.from) {
      return (data.from as Address).address || '';
    }

    return '';
  };

  const appendHeaders = (data: SendMailOptions): Object => {
    return HEADERS.reduce((headers, key) => {
      if (data[key]) {
        headers[TRANSFORM_FIELDS[key] || key] = data[key];
      }

      return headers;
    }, {});
  };

  const appendAddresses = (data: SendMailOptions): To[] => {
    return TO_KEYS.reduce((accumulator, target) => {
      if (!data[target]) return accumulator;

      (data[target] as Address[]).forEach(to => {
        accumulator.push({
          email: to.address,
          name: to.name,
          type: target
        });
      });

      return accumulator;
    }, [] as To[]);
  };

  const appendAttachments = (data: SendMailOptions): Attachments[] => {
    if (!Array.isArray(data.attachments)) return [];

    return data.attachments.reduce((accumulator, attachment) => {
      if (!attachment.contentType.startsWith('image/')) {
        accumulator.push({
          name: attachment.filename || attachment.cid,
          type: attachment.contentType,
          content: attachment.content as string
        });
      }

      return accumulator;
    }, [] as Attachments[]);
  };

  const appendImages = (data: SendMailOptions): Attachments[] => {
    if (!Array.isArray(data.attachments)) return [];

    return data.attachments.reduce((accumulator, attachment) => {
      if (attachment.contentType.startsWith('image/')) {
        accumulator.push({
          name: attachment.cid,
          type: attachment.contentType,
          content: attachment.content as string
        });
      }

      return accumulator;
    }, [] as Attachments[]);
  };

  export const buildData = (data: SendMailOptions, key: string) => {
    return {
      key,
      message: {
        html: data.html,
        text: data.text,
        subject: data.subject,
        from_email: getFromAddress(data),
        from_name: getFromName(data),
        to: appendAddresses(data),
        headers: appendHeaders(data),
        attachments: appendAttachments(data),
        images: appendImages(data)
      }
    };
  };
}
