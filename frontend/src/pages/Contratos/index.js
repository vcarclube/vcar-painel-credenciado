import React, { useContext, useRef } from 'react';
import { Header, Sidebar, BottomNavigation, Button } from '../../components';
import '../Home/style.css';
import './style.css';
import { FiFileText, FiPrinter, FiDownload } from 'react-icons/fi';
import { MainContext } from '../../helpers/MainContext';

const Contratos = () => {
  const { user } = useContext(MainContext);
  const razaoSocial = user?.RazaoSocial || user?.Descricao || '';
  const cnpj = user?.Cnpj || '';
  const representanteNome = user?.Nome || '';
  const representanteCargo = user?.Cargo || '';
  const enderecoLinha1 = [user?.Endereco, user?.EnderecoComplemento].filter(v => v && String(v).trim() !== '').join(', ');
  const enderecoLinha2 = [user?.EnderecoBairro, user?.EnderecoCidade && user?.EnderecoUf ? `${user.EnderecoCidade} - ${user.EnderecoUf}` : (user?.EnderecoCidade || user?.EnderecoUf || '')].filter(v => v && String(v).trim() !== '').join(', ');
  const enderecoCep = user?.EnderecoCep ? `CEP ${user.EnderecoCep}` : '';

  const cardRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    try {
      const contentEl = cardRef.current?.querySelector('.contrato-content');
      const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Contrato do Credenciado</title></head><body>${contentEl?.innerHTML || ''}</body></html>`;
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato_credenciado.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {}
  };

  return (
    <div className="home-container">
      <Sidebar />
      <div className="main-content" style={{paddingBottom: '0px', marginBottom: '0px'}}>
        <Header />
        <center>
          <div className="contratos-container">
            <div className="contratos-card" ref={cardRef}>
              <div className="contratos-header">
                <div className="contratos-title">
                  <FiFileText className="contratos-icon" />
                  <h1>Contrato do Credenciado</h1>
                </div>
                <div className="contratos-actions" style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <Button variant="secondary" onClick={handlePrint}>
                    <FiPrinter style={{ marginRight: 8 }} /> Imprimir
                  </Button>
                  <Button variant="primary" onClick={handleDownload}>
                    <FiDownload style={{ marginRight: 8 }} /> Baixar contrato
                  </Button>
                </div>
              </div>
              <div className="contrato-content">
                <h1>CONTRATO DE CREDENCIAMENTO DE OFICINA/AUTOCENTER PARCEIRO VCAR CLUB</h1>
                <p>Pelo presente instrumento particular, de um lado:</p>
                <h2>EMPRESA CREDENCIADORA</h2>
                <p>
                  <strong>Razão Social:</strong> V-Car Clube Centro Automotivo Ltda.<br />
                  <strong>CNPJ:</strong> 54.310.846/0001-57<br />
                  <strong>Sede:</strong> Brasília<br />
                  <strong>Representada neste ato por:</strong> Ailton Valenca de Pontes, Proprietário<br />
                  doravante denominada <strong>CREDENCIADORA</strong>,
                </p>
                <p>e de outro lado:</p>
                <h2>OFICINA/AUTO CENTER CREDENCIADO</h2>
                <p>
                  <strong>Razão Social:</strong> {razaoSocial}<br />
                  <strong>CNPJ:</strong> {cnpj}<br />
                  <strong>Endereço:</strong> {enderecoLinha1}{enderecoLinha1 && (enderecoLinha2 || enderecoCep) ? <><br /></> : null}{enderecoLinha2}{enderecoLinha2 && enderecoCep ? <><br /></> : null}{enderecoCep}<br />
                  <strong>Representada neste ato por:</strong> {representanteNome}{representanteCargo ? `, ${representanteCargo}` : ''}<br />
                  doravante denominada <strong>CREDENCIADA</strong>,
                </p>
                <p>têm entre si, justo e contratado, o seguinte:</p>
                <hr />
                <h2>CLÁUSULA 1 – OBJETO</h2>
                <p><strong>1.1.</strong> O presente contrato tem por objeto o credenciamento da CREDENCIADA para a prestação de serviços de manutenção e reparos em veículos de associados da CREDENCIADORA, conforme condições, serviços e padrões estabelecidos neste contrato e seus anexos.</p>
                <p><strong>1.2.</strong> A CREDENCIADORA atua como plataforma tecnológica de intermediação entre associados e prestadores de serviços automotivos credenciados.</p>
                <p><strong>1.3.</strong> O credenciamento não gera exclusividade para nenhuma das partes.</p>
                <h2>CLÁUSULA 2 – ALINHAMENTO DE SERVIÇOS E CONDIÇÕES</h2>
                <p><strong>2.1.</strong> O atendimento aos associados será realizado de acordo com os planos e regulamentações internas da CREDENCIADORA, utilizando as ferramentas sistêmicas disponibilizadas para recebimento e acompanhamento das demandas.</p>
                <p><strong>2.2.</strong> Em caso de indisponibilidade temporária do sistema, a CREDENCIADA poderá realizar o atendimento mediante comunicação por telefone ou e-mail, devendo registrar posteriormente no sistema quando disponível.</p>
                <p><strong>2.3.</strong> A CREDENCIADA compromete-se a realizar os serviços previstos nos planos dos associados, conforme listagem expressa no Anexo I. Serviços fora dessa listagem exigem autorização prévia da CREDENCIADORA.</p>
                <p><strong>2.4.</strong> É vedada a cobrança de qualquer valor referente à mão de obra dos associados nos serviços cobertos pelo plano, salvo exceções previamente autorizadas.</p>
                <p><strong>2.5.</strong> As peças eventualmente fornecidas pela CREDENCIADA deverão ter um acréscimo máximo de 25% sobre o valor de custo, referente às taxas administrativas. Este percentual poderá ser reajustado anualmente, mediante comunicação prévia de 30 dias.</p>
                <p><strong>2.6.</strong> Nos casos de fornecimento de peças pelo próprio associado, sua aplicação dependerá de aprovação técnica, com documentação e anotação na ordem de serviço.</p>
                <p><strong>2.7.</strong> Registros detalhados de cada atendimento deverão ser realizados no sistema, incluindo dados, serviço executado, peças utilizadas, observações e evidências quando solicitado.</p>
                <h2>CLÁUSULA 3 – SERVIÇOS COBERTOS E SERVIÇOS EXCLUÍDOS</h2>
                <p><strong>3.1.</strong> A relação dos serviços contemplados nos planos, bem como aqueles expressamente excluídos, será disponibilizada no Anexo I deste contrato.</p>
                <p><strong>3.2.</strong> Qualquer alteração no Anexo I será comunicada à CREDENCIADA com antecedência mínima de 15 dias, por meio de notificação através da plataforma.</p>
                <h2>CLÁUSULA 4 – EXCLUSÕES, LIMITES E RESSALVAS</h2>
                <p><strong>4.1.</strong> Serviços não previstos no Anexo I e/ou expressamente excluídos pelo regulamento do plano não deverão ser executados sem autorização. Serviços excluídos não serão remunerados.</p>
                <p><strong>4.2.</strong> A CREDENCIADORA compromete-se a responder solicitações para serviços adicionais em até 24 horas úteis.</p>
                <p><strong>4.3.</strong> Serviços que comprometam a segurança do veículo poderão ser recusados pela CREDENCIADA mediante justificativa técnica.</p>
                <h2>CLÁUSULA 5 – REMUNERAÇÃO E PAGAMENTO</h2>
                <p><strong>5.1.</strong> A CREDENCIADA receberá valores conforme tabela vigente (Anexo II), com pagamento até o 15º dia útil do mês subsequente.</p>
                <p><strong>5.2.</strong> Valores poderão ser reajustados anualmente pelo IPCA, mediante comunicação prévia de 30 dias.</p>
                <p><strong>5.3.</strong> Atrasos superiores a 15 dias terão juros de 1% ao mês e multa de 2%.</p>
                <p><strong>5.4.</strong> Peças cobradas diretamente ao associado, com ciência e concordância, aplicando-se apenas a taxa administrativa prevista.</p>
                <h2>CLÁUSULA 6 – PROTEÇÃO DE DADOS (LGPD)</h2>
                <p><strong>6.1.</strong> Ambas as partes comprometem-se a cumprir integralmente a Lei Geral de Proteção de Dados.</p>
                <p><strong>6.2.</strong> A CREDENCIADA atuará como operadora de dados pessoais, podendo utilizá-los exclusivamente para execução dos serviços.</p>
                <p><strong>6.3.</strong> A CREDENCIADA compromete-se a implementar medidas de proteção, não compartilhar indevidamente, comunicar incidentes e permitir auditorias.</p>
                <p><strong>6.4.</strong> Em caso de violação de dados por negligência, responderá pelos danos.</p>
                <h2>CLÁUSULA 7 – PRAZO E RENOVAÇÃO</h2>
                <p><strong>7.1.</strong> Vigência de 12 meses, com renovação automática, salvo manifestação contrária.</p>
                <p><strong>7.2.</strong> Não renovação deve ser comunicada com antecedência mínima de 60 dias.</p>
                <h2>CLÁUSULA 8 – RESCISÃO</h2>
                <p><strong>8.1.</strong> Rescisão sem justa causa mediante aviso prévio de 30 dias.</p>
                <p><strong>8.2.</strong> Rescisão imediata em caso de descumprimento reiterado, violação grave da LGPD, falência ou atos que comprometam a reputação.</p>
                <p><strong>8.3.</strong> Rescisão por justa causa imputável à CREDENCIADA pode inviabilizar recebimento de valores dos 30 dias anteriores.</p>
                <p><strong>8.4.</strong> A rescisão não prejudica o direito de buscar perdas e danos.</p>
                <h2>CLÁUSULA 9 – APROVAÇÃO DE ORDEM DE SERVIÇO</h2>
                <p><strong>9.1.</strong> Serviços do Anexo I podem ser executados sem aprovação prévia.</p>
                <p><strong>9.2.</strong> Serviços fora do Anexo I exigem aprovação prévia em até 24 horas úteis.</p>
                <p><strong>9.3.</strong> Aprovação via sistema, com envio de evidências e orçamento.</p>
                <p><strong>9.4.</strong> Serviços sem aprovação, quando exigida, não serão remunerados, salvo emergências justificadas.</p>
                <p><strong>9.5.</strong> Emergências podem ter execução imediata e aprovação posterior em até 4 horas.</p>
                <h2>CLÁUSULA 10 – RESPONSABILIDADES E GARANTIAS</h2>
                <p><strong>10.1.</strong> A CREDENCIADA deve manter equipe qualificada, licenças válidas, garantir serviços por 90 dias e atender com cortesia.</p>
                <p><strong>10.2.</strong> A CREDENCIADORA deve fornecer treinamento, suporte, efetuar pagamentos e comunicar alterações.</p>
                <h2>CLÁUSULA 11 – FORÇA MAIOR E CASO FORTUITO</h2>
                <p><strong>11.1.</strong> Nenhuma parte será responsabilizada por atrasos decorrentes de força maior.</p>
                <p><strong>11.2.</strong> A parte afetada deve comunicar a ocorrência e minimizar impactos.</p>
                <h2>CLÁUSULA 12 – DISPOSIÇÕES GERAIS</h2>
                <p><strong>12.1.</strong> O credenciamento não implica vínculo empregatício, societário ou exclusividade.</p>
                <p><strong>12.2.</strong> A CREDENCIADORA atua como intermediadora tecnológica.</p>
                <p><strong>12.3.</strong> Alterações contratuais válidas somente por escrito e assinadas.</p>
                <p><strong>12.4.</strong> Tolerância não constitui novação ou renúncia.</p>
                <p><strong>12.5.</strong> Invalidade de uma disposição não afeta as demais.</p>
                <h2>CLÁUSULA 13 – MEDIAÇÃO E ARBITRAGEM</h2>
                <p><strong>13.1.</strong> As partes buscarão solução amigável por mediação.</p>
                <p><strong>13.2.</strong> Persistindo conflito, controvérsias serão submetidas à arbitragem.</p>
                <p><strong>13.3.</strong> Subsidiariamente, foro da Comarca da CREDENCIADA.</p>
                <hr />
                <h2>ANEXO I – SERVIÇOS COBERTOS E EXCLUÍDOS</h2>
                <h3>Serviços cobertos</h3>
                <h4>Manutenção preventiva</h4>
                <ul>
                  <li>Troca de óleo e filtros</li>
                  <li>Verificação e completamento de fluidos</li>
                  <li>Inspeção de componentes básicos</li>
                </ul>
                <h4>Sistema de freios</h4>
                <ul>
                  <li>Substituição de pastilhas e lonas</li>
                  <li>Troca de discos e tambores</li>
                  <li>Sangria e troca de fluido</li>
                  <li>Substituição de mangueiras e conexões</li>
                </ul>
                <h4>Suspensão e direção</h4>
                <ul>
                  <li>Alinhamento e balanceamento</li>
                  <li>Geometria 3D</li>
                  <li>Substituição de amortecedores e molas</li>
                  <li>Troca de buchas e coxins</li>
                  <li>Substituição de terminais e barras estabilizadoras</li>
                </ul>
                <h4>Motor</h4>
                <ul>
                  <li>Troca de correias</li>
                  <li>Substituição de velas e cabos</li>
                  <li>Troca de filtros</li>
                  <li>Substituição de mangueiras e abraçadeiras</li>
                  <li>Troca de bomba d'água</li>
                  <li>Limpeza de bicos injetores</li>
                </ul>
                <h4>Sistema elétrico básico</h4>
                <ul>
                  <li>Substituição de bateria</li>
                  <li>Troca de alternador e motor de partida</li>
                  <li>Substituição de fusíveis e relés</li>
                  <li>Reparo em iluminação</li>
                </ul>
                <h3>Serviços excluídos</h3>
                <h4>Sistemas eletrônicos complexos</h4>
                <ul>
                  <li>Manutenção de ABS</li>
                  <li>Serviços em centrais eletrônicas</li>
                  <li>Reprogramação de módulos</li>
                </ul>
                <h4>Reparos estruturais</h4>
                <ul>
                  <li>Serviços em chassi</li>
                  <li>Soldas estruturais</li>
                  <li>Carroceria e pintura</li>
                </ul>
                <h4>Transmissão</h4>
                <ul>
                  <li>Kit de embreagem</li>
                  <li>Câmbio automático ou manual</li>
                  <li>Diferencial</li>
                </ul>
                <h4>Motor (complexos)</h4>
                <ul>
                  <li>Retífica de motor</li>
                  <li>Comando de válvulas</li>
                  <li>Correntes de comando</li>
                  <li>Cabeçote</li>
                </ul>
                <h4>Ar condicionado</h4>
                <ul>
                  <li>Recarga de gás</li>
                  <li>Substituição de compressor</li>
                  <li>Reparo no sistema</li>
                </ul>
                <hr />
                <h2>ANEXO II – TABELA DE REMUNERAÇÃO</h2>
                <p><em>A tabela de valores será fornecida separadamente através da plataforma e atualizada conforme necessário.</em></p>
                <hr />
                <h3>CREDENCIADORA</h3>
                <p>
                  <strong>VCAR CLUBE LTDA.</strong><br />
                  Ailton Valenca de Pontes<br />
                  Proprietário
                </p>
                <p>_________________________________</p>
                <h3>CREDENCIADA</h3>
                <p>
                  {razaoSocial}<br />
                  {representanteNome}<br />
                  {representanteCargo}
                </p>
              </div>
            </div>
          </div>
        </center>
        <BottomNavigation />
      </div>
    </div>
  );
};

export default Contratos;