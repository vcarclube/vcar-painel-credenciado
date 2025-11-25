import React, { useRef } from 'react';
import '../Contratos/style.css';
import { FiFileText } from 'react-icons/fi';

const ContratoModelo = () => {
  const cardRef = useRef(null);

  

  return (
    <center>
      <div className="contratos-container">
        <div className="contratos-card" ref={cardRef}>
              <div className="contratos-header">
                <div className="contratos-title">
                  <FiFileText className="contratos-icon" />
                  <h1>Contrato Modelo</h1>
                </div>
                
              </div>
              <div className="contrato-content">
                <h1>CONTRATO DE CREDENCIAMENTO DE OFICINA/AUTOCENTER PARCEIRO VCAR CLUB</h1>
                <p>Pelo presente instrumento particular, de um lado:</p>
                <h2>EMPRESA CREDENCIADORA</h2>
                <p>
                  <strong>Razão Social:</strong> VCAR CLUB LTDA.<br />
                  <strong>CNPJ:</strong> [Número do CNPJ]<br />
                  <strong>Sede:</strong> Brasil<br />
                  <strong>Representada neste ato por:</strong> [Nome do Representante Legal], [Cargo]<br />
                  doravante denominada <strong>CREDENCIADORA</strong>,
                </p>
                <p>e de outro lado:</p>
                <h2>OFICINA/AUTO CENTER CREDENCIADO</h2>
                <p>
                  <strong>Razão Social:</strong> [Nome da Oficina]<br />
                  <strong>CNPJ:</strong> [Número do CNPJ]<br />
                  <strong>Endereço:</strong> [Endereço Completo]<br />
                  <strong>Representada neste ato por:</strong> [Nome do Representante Legal], [Cargo]<br />
                  doravante denominada <strong>CREDENCIADA</strong>,
                </p>
                <p>têm entre si, justo e contratado, o seguinte:</p>
                <hr />
                <h2>CLÁUSULA 1 – OBJETO</h2>
                <p><strong>1.1.</strong> O presente contrato tem por objeto o credenciamento da CREDENCIADA para a prestação de serviços de manutenção e reparos em veículos de associados da CREDENCIADORA, conforme condições, serviços e padrões estabelecidos neste contrato e seus anexos.</p>
                <p><strong>1.2.</strong> A CREDENCIADORA é uma plataforma tecnológica que intermedia a conexão entre associados e prestadores de serviços automotivos credenciados.</p>
                <p><strong>1.3.</strong> O credenciamento não gera exclusividade para nenhuma das partes, podendo ambas manter relacionamentos comerciais com terceiros em suas respectivas áreas de atuação.</p>
                <h2>CLÁUSULA 2 – ALINHAMENTO DE SERVIÇOS E CONDIÇÕES</h2>
                <p><strong>2.1.</strong> O atendimento aos associados será realizado de acordo com os planos e regulamentações internas da CREDENCIADORA, utilizando exclusivamente as ferramentas sistêmicas (plataformas digitais, aplicativo VCAR Club, etc.) disponibilizadas pela CREDENCIADORA para recebimento e acompanhamento das demandas.</p>
                <p><strong>2.2.</strong> Em caso de indisponibilidade temporária do sistema da CREDENCIADORA, a CREDENCIADA poderá realizar o atendimento mediante abertura de chamado por meio dos canais disponíveis, devendo registrar posteriormente no sistema assim que este estiver disponível.</p>
                <p><strong>2.3.</strong> A CREDENCIADA compromete-se a realizar os serviços previstos nos planos dos associados, conforme listagem expressa no Anexo I. Serviços fora dessa listagem estão estritamente vetados neste contrato.</p>
                <p><strong>2.4.</strong> É vedada a cobrança de qualquer valor referente à mão de obra dos associados nos serviços cobertos pelo plano, salvo exceções previamente autorizadas e informadas via sistema pela CREDENCIADORA.</p>
                <p><strong>2.5.</strong> As peças eventualmente fornecidas pela CREDENCIADA deverão ter um acréscimo máximo de 30% (trinta por cento) sobre o valor de custo, referente às taxas administrativas. Este percentual poderá ser reajustado anualmente, mediante comunicação prévia de 30 (trinta) dias.</p>
                <p><strong>2.6.</strong> Nos casos de fornecimento de peças pelo próprio associado, especialmente peças usadas ou recondicionadas, sua aplicação dependerá de aprovação técnica do responsável pela oficina, com a respectiva documentação (fotos/vídeos) e registro na ordem de serviço.</p>
                <p><strong>2.7.</strong> Registros detalhados de cada atendimento deverão ser realizados no sistema, incluindo: dados do associado, serviço executado, peças utilizadas, observações relevantes e registro de evidências quando solicitado.</p>
                <h2>CLÁUSULA 3 – SERVIÇOS COBERTOS E SERVIÇOS EXCLUÍDOS</h2>
                <p><strong>3.1.</strong> A relação dos serviços contemplados nos planos, bem como aqueles expressamente excluídos, será disponibilizada no Anexo I deste contrato, que passa a integrar o presente instrumento para todos os fins.</p>
                <p><strong>3.2.</strong> Qualquer alteração no Anexo I será comunicada à CREDENCIADA com antecedência mínima de 15 (quinze) dias, por meio de notificação escrita ou eletrônica através da plataforma.</p>
                <h2>CLÁUSULA 4 – EXCLUSÕES, LIMITES E RESSALVAS</h2>
                <p><strong>4.1.</strong> Serviços não previstos no Anexo I e/ou expressamente excluídos pelo regulamento do plano do associado não são de responsabilidade da CREDENCIADORA e não deverão ser executados sem prévia autorização formal.</p>
                <p><strong>4.2.</strong> A CREDENCIADORA compromete-se a responder às solicitações de autorização para serviços adicionais no prazo máximo de 24 (vinte e quatro) horas úteis através da plataforma tecnológica.</p>
                <p><strong>4.3.</strong> Serviços em desacordo com recomendações técnicas ou que comprometam a segurança do veículo poderão ser recusados pela CREDENCIADA, mediante justificativa técnica fundamentada.</p>
                <h2>CLÁUSULA 5 – REMUNERAÇÃO E PAGAMENTO</h2>
                <p><strong>5.1.</strong> A CREDENCIADA receberá da CREDENCIADORA os valores correspondentes aos serviços executados no período compreendido entre o primeiro e o último dia de cada mês, conforme tabela vigente anexa a este contrato (Anexo II). A CREDENCIADA terá a opção de receber seus pagamentos em frequência quinzenal ou mensal. O pagamento, independentemente da frequência escolhida, será efetuado até o 10º (décimo) dia útil do mês subsequente ao da emissão da respectiva nota fiscal referente ao período de serviços faturado.</p>
                <p><strong>5.2.</strong> Os valores da tabela de remuneração poderão ser reajustados anualmente pelo IPCA ou outro índice que venha a substituí-lo, mediante comunicação prévia de 30 (trinta) dias através da plataforma.</p>
                <p><strong>5.3.</strong> Em caso de atraso no pagamento superior a 15 (quinze) dias, incidirão juros de mora de 1% (um por cento) ao mês e multa de 2% (dois por cento) sobre o valor devido.</p>
                <p><strong>5.4.</strong> Para as peças fornecidas pela CREDENCIADA, valerá exclusivamente o percentual e os termos indicados na cláusula 2.5 deste contrato.</p>
                <h2>CLÁUSULA 6 – PROTEÇÃO DE DADOS (LGPD)</h2>
                <p><strong>6.1.</strong> Ambas as partes se comprometem a cumprir integralmente a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e demais normas correlatas.</p>
                <p><strong>6.2.</strong> A CREDENCIADA atuará como operadora de dados pessoais, podendo utilizá-los exclusivamente para execução dos serviços contratados e cumprimento de obrigações legais.</p>
                <p><strong>6.3.</strong> A CREDENCIADA compromete-se a implementar medidas técnicas e organizacionais adequadas para proteger os dados pessoais; não compartilhar, vender ou transferir dados pessoais a terceiros não autorizados; comunicar à CREDENCIADORA qualquer incidente de segurança em até 24 (vinte e quatro) horas através da plataforma; permitir auditorias de conformidade mediante agendamento prévio de 15 (quinze) dias.</p>
                <p><strong>6.4.</strong> Em caso de violação de dados causada por negligência da CREDENCIADA, esta responderá integralmente pelos danos causados.</p>
                <h2>CLÁUSULA 7 – PRAZO E RENOVAÇÃO</h2>
                <p><strong>7.1.</strong> O presente contrato vigora pelo prazo de 12 (doze) meses, contados da data de assinatura, e será renovado automaticamente por períodos iguais e sucessivos, salvo manifestação contrária de qualquer das partes.</p>
                <p><strong>7.2.</strong> A manifestação de não renovação deverá ser comunicada por escrito com antecedência mínima de 60 (sessenta) dias do término da vigência, podendo ser feita através da plataforma tecnológica.</p>
                <h2>CLÁUSULA 8 – RESCISÃO</h2>
                <p><strong>8.1.</strong> O contrato poderá ser rescindido por qualquer das partes, sem justa causa, mediante aviso prévio escrito de 30 (trinta) dias através da plataforma ou por meio físico.</p>
                <p><strong>8.2.</strong> O contrato poderá ser rescindido imediatamente, independentemente de aviso prévio, nas seguintes hipóteses: descumprimento reiterado das obrigações contratuais, após notificação e prazo de 15 (quinze) dias para regularização; violação grave da LGPD ou vazamento de dados por negligência; falência, recuperação judicial, dissolução ou liquidação de qualquer das partes; prática de atos que comprometam a imagem ou reputação da outra parte.</p>
                <p><strong>8.3.</strong> Em caso de rescisão por justa causa imputável à CREDENCIADA, esta não fará jus ao recebimento de valores pendentes relativos aos 30 (trinta) dias anteriores à rescisão.</p>
                <p><strong>8.4.</strong> A rescisão não prejudica o direito das partes de buscar eventuais perdas e danos decorrentes do descumprimento contratual.</p>
                <h2>CLÁUSULA 9 – APROVAÇÃO DE ORDEM DE SERVIÇO</h2>
                <p><strong>9.1.</strong> O processo de aprovação será realizado via sistema eletrônico, mediante envio de fotos, vídeos.</p>
                <p><strong>9.2.</strong> Os serviços incluídos no Anexo I devem ser obrigatoriamente aprovados previamente pela CREDENCIADORA e devidamente registrados na plataforma tecnológica para que sua execução seja autorizada.</p>
                <p><strong>9.3.</strong> Serviços executados sem aprovação prévia, quando exigida, não serão remunerados pela CREDENCIADORA, salvo em situações de emergência devidamente justificadas.</p>
                <p><strong>9.4.</strong> Não serão remunerados os serviços que não estiverem previstos no Anexo I deste contrato.</p>
                <h2>CLÁUSULA 10 – RESPONSABILIDADES E GARANTIAS</h2>
                <p><strong>10.1.</strong> A CREDENCIADA obriga-se a: manter equipe técnica devidamente qualificada e equipamentos adequados; possuir e manter válidos todos os alvarás, licenças e registros exigidos por lei; oferecer garantia mínima de 90 (noventa) dias para serviços executados; tratar os associados com cortesia e profissionalismo.</p>
                <p><strong>10.2.</strong> A CREDENCIADORA obriga-se a: fornecer treinamento adequado sobre os sistemas e procedimentos através de plataforma digital; disponibilizar suporte técnico durante horário comercial através de canais digitais; efetuar os pagamentos nos prazos estabelecidos; comunicar alterações nos procedimentos com antecedência adequada através da plataforma.</p>
                <h2>CLÁUSULA 11 – FORÇA MAIOR E CASO FORTUITO</h2>
                <p><strong>11.1.</strong> Nenhuma das partes será responsabilizada por atrasos ou impossibilidade de cumprimento de suas obrigações decorrentes de caso fortuito ou força maior, conforme definido no Código Civil Brasileiro.</p>
                <p><strong>11.2.</strong> A parte afetada deverá comunicar imediatamente a outra sobre a ocorrência através da plataforma tecnológica e envidar esforços para minimizar os impactos.</p>
                <h2>CLÁUSULA 12 – DISPOSIÇÕES GERAIS</h2>
                <p><strong>12.1.</strong> O credenciamento não implica vínculo empregatício, societário ou de exclusividade entre as partes.</p>
                <p><strong>12.2.</strong> A CREDENCIADORA atua exclusivamente como intermediadora tecnológica, não assumindo responsabilidade pelos serviços técnicos executados pela CREDENCIADA.</p>
                <p><strong>12.3.</strong> Alterações contratuais somente serão válidas se formalizadas por escrito e assinadas por ambas as partes, podendo ser comunicadas através da plataforma tecnológica.</p>
                <p><strong>12.4.</strong> A tolerância com eventual descumprimento de qualquer cláusula não constituirá novação ou renúncia ao direito de exigir seu cumprimento.</p>
                <p><strong>12.5.</strong> Se qualquer disposição deste contrato for considerada inválida ou inexequível, as demais permanecerão em pleno vigor.</p>
                <p><strong>12.6.</strong> Para todos os efeitos legais, será considerada sempre como válida a data original do contrato para definir a sua vigência e demais efeitos jurídicos, salvo nos casos em que houver aditivo contratual. Nesses casos, prevalecerá para a matéria específica do aditivo a data de assinatura do referido aditivo.</p>
                <p><strong>12.7.</strong> O presente contrato, assim como seus aditivos, será assinado de forma eletrônica por meio de plataforma específica, nos termos da Lei 14.063/2020 e demais legislações aplicáveis. As assinaturas eletrônicas constantes neste documento possuem validade jurídica, sendo consideradas equivalentes às assinaturas físicas para todos os fins, incluindo a vinculação das partes e o cumprimento das respectivas obrigações.</p>
                <h2>CLÁUSULA 13 – COMUNICAÇÕES</h2>
                <p><strong>13.1.</strong> Todas as comunicações entre as partes deverão ser realizadas preferencialmente através da plataforma tecnológica VCAR Club.</p>
                <p><strong>13.2.</strong> Comunicações urgentes ou formais poderão ser realizadas através de e-mail ou correspondência registrada.</p>
                <p><strong>13.3.</strong> A CREDENCIADA compromete-se a manter seus dados de contato constantemente atualizados na plataforma.</p>
                <h2>CLÁUSULA 14 – MEDIAÇÃO E ARBITRAGEM</h2>
                <p><strong>14.1.</strong> As partes comprometem-se a buscar a solução amigável de eventuais conflitos por meio de mediação online, antes de recorrer ao Poder Judiciário.</p>
                <p><strong>14.2.</strong> Não sendo possível a solução por mediação, as controvérsias serão submetidas à arbitragem online, conforme regulamento da Câmara de Arbitragem escolhida pelas partes.</p>
                <p><strong>14.3.</strong> Subsidiariamente, fica eleito o foro da Comarca onde está localizada a CREDENCIADA para dirimir quaisquer questões oriundas deste contrato.</p>
                <hr />
                <h2>ANEXO I – SERVIÇOS COBERTOS E EXCLUÍDOS</h2>
                <h3>Serviços cobertos pelo plano</h3>
                <h4>Manutenção Preventiva</h4>
                <ul>
                  <li>Troca de óleo e filtros (conforme periodicidade do plano)</li>
                  <li>Verificação e completamento de fluidos</li>
                  <li>Inspeção de componentes básicos</li>
                </ul>
                <h4>Sistema de Freios</h4>
                <ul>
                  <li>Substituição de pastilhas e lonas de freio</li>
                  <li>Troca de discos e tambores de freio</li>
                  <li>Sangria e troca de fluido de freio</li>
                  <li>Substituição de mangueiras e conexões do sistema</li>
                </ul>
                <h4>Suspensão e Direção</h4>
                <ul>
                  <li>Alinhamento e balanceamento</li>
                  <li>Substituição de amortecedores e molas</li>
                  <li>Troca de buchas e coxins</li>
                  <li>Substituição de terminais de direção e barras estabilizadoras</li>
                </ul>
                <h4>Motor</h4>
                <ul>
                  <li>Troca de correias (exceto banhadas a óleo)</li>
                  <li>Substituição de velas e cabos de vela</li>
                  <li>Troca de filtros (ar, combustível, cabine)</li>
                  <li>Substituição de mangueiras e abraçadeiras</li>
                  <li>Troca de bomba d'água</li>
                  <li>Limpeza de bicos injetores</li>
                </ul>
                <h4>Sistema Elétrico Básico</h4>
                <ul>
                  <li>Substituição de bateria</li>
                  <li>Troca de alternador e motor de partida</li>
                  <li>Substituição de fusíveis e relés</li>
                  <li>Reparo em sistema de iluminação</li>
                </ul>
                <h3>Serviços expressamente excluídos</h3>
                <h4>Sistemas Eletrônicos Complexos</h4>
                <ul>
                  <li>Manutenção ou reparo de componentes do sistema ABS</li>
                  <li>Serviços em centrais eletrônicas (ECU, BCM, etc.)</li>
                  <li>Reprogramação de módulos eletrônicos</li>
                </ul>
                <h4>Reparos Estruturais</h4>
                <ul>
                  <li>Serviços em chassi empenado ou danificado</li>
                  <li>Soldas estruturais</li>
                  <li>Reparos de carroceria e pintura</li>
                </ul>
                <h4>Transmissão</h4>
                <ul>
                  <li>Troca ou reparo de kit de embreagem</li>
                  <li>Manutenção de câmbio automático ou manual</li>
                  <li>Reparo de diferencial</li>
                </ul>
                <h4>Motor (Serviços Complexos)</h4>
                <ul>
                  <li>Retífica de motor</li>
                  <li>Troca de comando de válvulas</li>
                  <li>Substituição de correntes de comando</li>
                  <li>Reparo de cabeçote</li>
                </ul>
                <h4>Ar Condicionado</h4>
                <ul>
                  <li>Recarga de gás refrigerante</li>
                  <li>Substituição de compressor</li>
                  <li>Reparo no sistema de climatização</li>
                </ul>
                <hr />
                <h2>ANEXO II – TABELA DE REMUNERAÇÃO</h2>
                <p><em>A tabela de valores será fornecida separadamente através da plataforma tecnológica e atualizada conforme necessário.</em></p>
                <hr />
                <p>Brasília, (data da assinatura eletrônica registrada na plataforma).</p>
                <h3>CREDENCIADORA</h3>
                <p>
                  <strong>VCAR CLUB LTDA.</strong><br />
                  [Nome do Representante Legal]<br />
                  [Cargo]<br />
                  (Assinado eletronicamente)
                </p>
                <h3>CREDENCIADA</h3>
                <p>
                  [Nome da Oficina/Autocenter]<br />
                  [Nome do Representante Legal]<br />
                  [Cargo]<br />
                  (Assinado eletronicamente)
                </p>
              </div>
        </div>
      </div>
    </center>
  );
};

export default ContratoModelo;
