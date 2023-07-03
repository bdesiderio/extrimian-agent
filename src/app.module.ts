import { Agent, AgentModenaUniversalRegistry, AgentModenaUniversalResolver } from '@extrimian/agent';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AgentService } from './app.service';
import { FileSystemAgentSecureStorage, FileSystemStorage } from './storage';
import { WACIProtocolService } from './waci-protocol-utils';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AgentService,
    WACIProtocolService,
    {
      provide: Agent,
      useFactory: async (wps: WACIProtocolService) => {
        const agent = new Agent({
          agentStorage: new FileSystemStorage({ filepath: "aduana-storage.json" }),
          didDocumentRegistry: new AgentModenaUniversalRegistry("https://demo.extrimian.com/sidetree-proxy", "did:quarkid:zksync"),
          didDocumentResolver: new AgentModenaUniversalResolver("https://demo.extrimian.com/sidetree-proxy"),
          secureStorage: new FileSystemAgentSecureStorage({ filepath: "aduana-secure-storage.json" }),
          vcProtocols: [wps.getWaciProtocol()],
          vcStorage: new FileSystemStorage({ filepath: "aduana-vc-storage.json" })
        });

        await agent.initialize();

        if (agent.identity.getOperationalDID() == null) {
          const waitDIDCreation = new Promise<void>(async (resolve, reject) => {
            agent.identity.didCreated.on((args) => {
              resolve();
            })

            await agent.identity.createNewDID({
              dwnUrl: "https://demo.extrimian.com/dwn/"
            });
          });

          await waitDIDCreation;
        }


        return agent; // Devuelve el objeto de la clase Agent inicializado
      },
      inject: [WACIProtocolService]
    }
  ],

})
export class AppModule { }
