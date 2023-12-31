import { Inject, Injectable } from '@nestjs/common';
import { Agent, AgentModenaUniversalRegistry, AgentModenaUniversalResolver, CredentialFlow, WACICredentialOfferSucceded, WACIProtocol } from "@extrimian/agent"
import { FileSystemAgentSecureStorage, FileSystemStorage, MemoryStorage } from './storage';
import { WACIProtocolService } from './waci-protocol-utils';
import { decode } from 'base-64';

@Injectable()
export class AgentService {

  constructor(private readonly agent: Agent, private readonly wps: WACIProtocolService) {
    console.log("WPS", wps);


    agent.vc.credentialIssued.on((args) => {
      console.log(args.vc);

      //ACA SE DEBEN HACER LAS INTEGRACIONES CON SERVICIOS EXTERNOS PARA INFORMAR 
      //QUE SE REALIZÓ LA EMISIÓN (TODAVÍA FALTA EL OK DEL REMITENTE, EL ACK, PERO LA CREDENCIAL YA SE EMITIÓ)
    });

    agent.vc.presentationVerified.on(async (args) => {
      console.log(args);
      const data = await wps.getStorage().get((<any>args.thid));

      const thId = data[0].pthid;

      //Este es el id de WACI original
      console.log("WACI InvitationId", thId);

      //ACA SE DEBEN HACER LAS INTEGRACIONES CON SERVICIOS EXTERNOS PARA INFORMAR EL RESULTADO DE LA VERIFICACION
    });

    agent.vc.ackCompleted.on(async (args) => {
      const data = await wps.getStorage().get((<any>args.status).thid);

      const thId = data[0].pthid;

      //Este es el id de WACI original
      console.log("WACI InvitationId", thId);

      //ACA SE PUEDEN HACER LAS INTEGRACIONES CON SERVICIOS EXTERNOS PARA INFORMAR EL DEL OTRO LADO SE RECIBIO TODO OK (ACK)
    });
  }

  async getInvitationMessage(): Promise<{ invitationId: string, invitationContent: string }> {
    const invitationMessage = await this.agent.vc.createInvitationMessage({ flow: CredentialFlow.Issuance })

    console.log(invitationMessage.replace("didcomm://?_oob=", ""));
    const decoded = decode(invitationMessage.replace("didcomm://?_oob=", ""));
    console.log(decoded);
    const decodedMessage = JSON.parse(decoded);

    return {
      invitationId: decodedMessage.id,
      invitationContent: invitationMessage,
    }
  }

  async getVerificationMessage(): Promise<{ invitationId: string, invitationContent: string }> {
    const invitationMessage = await this.agent.vc.createInvitationMessage({ flow: CredentialFlow.Presentation })

    console.log(invitationMessage.replace("didcomm://?_oob=", ""));
    const decoded = decode(invitationMessage.replace("didcomm://?_oob=", ""));
    console.log(decoded);
    const decodedMessage = JSON.parse(decoded);

    return {
      invitationId: decodedMessage.id,
      invitationContent: invitationMessage,
    }
  }
}
