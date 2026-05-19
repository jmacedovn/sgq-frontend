
import { FormType, FormMetadata } from './types';

export const FORMS_CONFIG: FormMetadata[] = [
  {
    id: '1',
    type: FormType.FRUIT_DISCHARGE,
    title: 'Controle de Descarga de Frutas',
    code: 'F01.05-PR',
    revision: '10',
    emission: '10/05/2024',
    icon: 'fa-truck-ramp-box',
    color: 'bg-blue-600'
  },
  {
    id: '2',
    type: FormType.FRUIT_INTAKE,
    title: 'Controle de Entrada e Moagem da Fruta',
    code: 'F18.01-CQ',
    revision: '10',
    emission: '10/05/2024',
    icon: 'fa-apple-whole',
    color: 'bg-green-600'
  },
  {
    id: '3',
    type: FormType.PINEAPPLE_PULP,
    title: 'Relatório de % de Polpa de Abacaxi',
    code: 'F08.01-CQ',
    revision: '03',
    emission: '22/07/2025',
    icon: 'fa-droplet',
    color: 'bg-yellow-600'
  },
  {
    id: '4',
    type: FormType.BLENDER_RELEASE,
    title: 'Liberação de Blender',
    code: 'F02.08-CQ',
    revision: '03',
    emission: '10/05/2024',
    icon: 'fa-flask',
    color: 'bg-purple-600'
  },
  {
    id: '5',
    type: FormType.BLENDER_CONTROL,
    title: 'Controle de Blender',
    code: 'F01.03-PR',
    revision: '16',
    emission: '10/05/2024',
    icon: 'fa-gears',
    color: 'bg-orange-600'
  },
  {
    id: '6',
    type: FormType.REPROCESS_MONITORING,
    title: 'Monitoramento de Reprocessos',
    code: 'F-REPROC',
    revision: '01',
    emission: '10/05/2024',
    icon: 'fa-recycle',
    color: 'bg-red-600'
  },
  {
    id: '7',
    type: FormType.ORGANIC_APPLICATION,
    title: 'Aplicação de Insumos Orgânicos',
    code: 'F18.01-AG',
    revision: '00',
    emission: '02/04/2025',
    icon: 'fa-leaf',
    color: 'bg-emerald-600'
  },
  {
    id: '8',
    type: FormType.PESTICIDE_APPLICATION,
    title: 'Aplicação de Pesticidas',
    code: 'F01.01-AG',
    revision: '04',
    emission: '29/08/2022',
    icon: 'fa-bug-slash',
    color: 'bg-lime-700'
  },
  {
    id: '9',
    type: FormType.TRUCK_CHECKLIST,
    title: 'Checklist de Caminhões',
    code: 'F15.01-AG',
    revision: '01',
    emission: '29/08/2022',
    icon: 'fa-truck-moving',
    color: 'bg-slate-600'
  },
  {
    id: '10',
    type: FormType.FIELD_MAPPING,
    title: 'Mapeamento na Lavoura',
    code: 'F12.01-AG',
    revision: '02',
    emission: '05/09/2023',
    icon: 'fa-map-location-dot',
    color: 'bg-cyan-600'
  },
  {
    id: '11',
    type: FormType.MATERIAL_MOVEMENT,
    title: 'Movimentação de Materiais',
    code: 'F02.06-AL',
    revision: '01',
    emission: '27/09/2022',
    icon: 'fa-boxes-packing',
    color: 'bg-teal-600'
  },
  {
    id: '12',
    type: FormType.RECEPTION_ANALYSIS,
    title: 'Análise de Recebimento',
    code: 'F01.01-AL',
    revision: '06',
    emission: '27/09/2022',
    icon: 'fa-vial-circle-check',
    color: 'bg-rose-600'
  },
  {
    id: '13',
    type: FormType.RECEPTION_CHECKLIST,
    title: 'Checklist de Recebimento',
    code: 'F02.01-AL',
    revision: '07',
    emission: '27/09/2022',
    icon: 'fa-clipboard-check',
    color: 'bg-zinc-700'
  },
  {
    id: '14',
    type: FormType.FRUIT_TRUCK_INTAKE,
    title: 'Checklist Entrada Caminhões Fruta',
    code: 'F07.02-PR',
    revision: '08',
    emission: '12/07/2024',
    icon: 'fa-truck-front',
    color: 'bg-amber-600'
  },
  {
    id: '15',
    type: FormType.GATE_REGISTRATION,
    title: 'Cadastro Veículo Portaria',
    code: 'F37.01-PR',
    revision: '02',
    emission: '17/07/2024',
    icon: 'fa-id-card-clip',
    color: 'bg-sky-700'
  },
  {
    id: '16',
    type: FormType.ORDER_MOVEMENT,
    title: 'Ordem Entrada / Saída / Estoque',
    code: 'F01.07-EX',
    revision: '09',
    emission: '17/06/2025',
    icon: 'fa-file-invoice',
    color: 'bg-indigo-700'
  },
  {
    id: '17',
    type: FormType.CONTAINER_CHECKLIST,
    title: 'Checklist Carregamento Container',
    code: 'F01.02-EX',
    revision: '08',
    emission: '09/12/2020',
    icon: 'fa-box-open',
    color: 'bg-cyan-700'
  },
  {
    id: '18',
    type: FormType.TRUCK_INSPECTION,
    title: 'Checklist Inspeção de Caminhão',
    code: 'F06.01-EX',
    revision: '04',
    emission: '03/03/2021',
    icon: 'fa-screwdriver-wrench',
    color: 'bg-neutral-600'
  },
  {
    id: '19',
    type: FormType.PACKING_LIST,
    title: 'Relatório Packing List',
    code: 'F01.03-EX',
    revision: '06',
    emission: '16/07/2024',
    icon: 'fa-list-ol',
    color: 'bg-emerald-700'
  },
  {
    id: '20',
    type: FormType.SHIPPING_ORDER,
    title: 'Pedido de Carregamento',
    code: 'F07.01-EX',
    revision: '00',
    emission: '12/06/2024',
    icon: 'fa-file-signature',
    color: 'bg-indigo-600'
  },
  {
    id: '21',
    type: FormType.SHIPPING_CHECKLIST,
    title: 'Checklist de Carregamentos',
    code: 'F01.01-EX',
    revision: '09',
    emission: '09/12/2020',
    icon: 'fa-truck-loading',
    color: 'bg-slate-700'
  },
  {
    id: '22',
    type: FormType.PRODUCTION_MONITORING,
    title: 'Monitoramento de Produção CQ',
    code: 'F16.02-CQ',
    revision: '08',
    emission: '26/08/2024',
    icon: 'fa-microscope',
    color: 'bg-pink-700'
  },
  {
    id: '23',
    type: FormType.PULPING_OPERATION,
    title: 'Controle Operação Despolpamento',
    code: 'F01.15-PR',
    revision: '16',
    emission: '08/10/2025',
    icon: 'fa-industry',
    color: 'bg-lime-800'
  },
  {
    id: '24',
    type: FormType.ASEPTIC_BATCH_CONTROL,
    title: 'Controle Lotes/Amostras Asséptico',
    code: 'F06.06-PR',
    revision: '19',
    emission: '18/05/2022',
    icon: 'fa-vial',
    color: 'bg-blue-800'
  },
  {
    id: '25',
    type: FormType.STERILIZER_CONDITIONS,
    title: 'Condições Operação Esterilizador',
    code: 'F14.15-PR',
    revision: '22',
    emission: '10/05/2024',
    icon: 'fa-temperature-high',
    color: 'bg-red-800'
  },
  {
    id: '26',
    type: FormType.ASEPTIC_BAG_BATCH,
    title: 'Controle de Lotes Bags Assépticos',
    code: 'F34.01-PR',
    revision: '03',
    emission: '03/10/2023',
    icon: 'fa-suitcase-rolling',
    color: 'bg-cyan-800'
  },
  {
    id: '27',
    type: FormType.PHYSICAL_CHEMICAL_ANALYSIS,
    title: 'Análises Físico-Químicas por Lote',
    code: 'F10.01-CQ (FQ)',
    revision: '15',
    emission: '08/12/2025',
    icon: 'fa-flask-vial',
    color: 'bg-teal-600'
  },
  {
    id: '28',
    type: FormType.MICROBIOLOGICAL_ANALYSIS,
    title: 'Análises Microbiológicas por Lote',
    code: 'F10.01-CQ (MB)',
    revision: '15',
    emission: '08/12/2025',
    icon: 'fa-bacterium',
    color: 'bg-fuchsia-700'
  },
  {
    id: '29',
    type: FormType.BATCH_GENERATION,
    title: 'Gerador de Código de Lote',
    code: 'INT-LOTE',
    revision: '01',
    emission: 'Automático',
    icon: 'fa-barcode',
    color: 'bg-violet-600'
  },
  {
    id: '30',
    type: FormType.EQUIPMENT_CLEANING,
    title: 'Higienização e Sanitização (COP/CIP)',
    code: 'F01.20-CQ',
    revision: '14',
    emission: '15/12/2025',
    icon: 'fa-soap',
    color: 'bg-cyan-500'
  },
  {
    id: '32',
    type: FormType.AIR_CURTAIN_INSPECTION,
    title: 'Inspeção de Funcionamento das Cortinas de Ar',
    code: 'F31.01-CQ',
    revision: '06',
    emission: '14/10/2022',
    icon: 'fa-wind',
    color: 'bg-sky-500'
  },
  {
    id: '33',
    type: FormType.LAB_CLEANING,
    title: 'Limpeza dos Laboratórios, Contra-amostra e Segregado',
    code: 'F41.01-LI',
    revision: '02',
    emission: '11/01/2022',
    icon: 'fa-vial-virus',
    color: 'bg-indigo-500'
  },
  {
    id: '34',
    type: FormType.OZONE_MONITORING,
    title: 'Monitoramento do Sistema de Ozônio na Sanitização da Fruta',
    code: 'F03.11-CQ',
    revision: '08',
    emission: '14/10/2022',
    icon: 'fa-atom',
    color: 'bg-blue-400'
  },
  {
    id: '35',
    type: FormType.PERACETIC_ACID_MONITORING,
    title: 'Monitoramento do Ácido Peracético na Sanitização da Fruta',
    code: 'F03.12-CQ',
    revision: '03',
    emission: '14/10/2022',
    icon: 'fa-flask-vial',
    color: 'bg-emerald-400'
  },
  {
    id: '36',
    type: FormType.SCALE_VERIFICATION,
    title: 'Verificação de Balança',
    code: 'F02.05-CQ',
    revision: '06',
    emission: '14/10/2022',
    icon: 'fa-weight-hanging',
    color: 'bg-amber-500'
  },
  {
    id: '37',
    type: FormType.PH_METER_VERIFICATION,
    title: 'Verificação do pHmetro',
    code: 'F02.02-CQ',
    revision: '09',
    emission: '14/10/2022',
    icon: 'fa-droplet',
    color: 'bg-cyan-500'
  },
  {
    id: '38',
    type: FormType.REFRACTOMETER_VERIFICATION,
    title: 'Verificação do Refratômetro',
    code: 'F02.03-CQ',
    revision: '07',
    emission: '14/10/2022',
    icon: 'fa-eye',
    color: 'bg-orange-500'
  },
  {
    id: '39',
    type: FormType.FRIDGE_TEMPERATURE_VERIFICATION,
    title: 'Verificação da Temperatura das Geladeiras e Marmiteiros',
    code: 'F02.10-CQ',
    revision: '04',
    emission: '14/10/2022',
    icon: 'fa-temperature-low',
    color: 'bg-blue-600'
  },
  {
    id: '40',
    type: FormType.BOILER_WATER_PH_REGISTRATION,
    title: 'Registro do pH da Água de Entrada e Saída da Caldeira',
    code: 'F01.21-CQ',
    revision: '09',
    emission: '14/10/2022',
    icon: 'fa-water',
    color: 'bg-sky-600'
  },
  {
    id: '41',
    type: FormType.LABEL_DELIVERY,
    title: 'Entrega de Etiquetas para Rotulagem dos Tambores',
    code: 'F01.07-CQ',
    revision: '09',
    emission: '10/05/2024',
    icon: 'fa-tags',
    color: 'bg-teal-700'
  },
  {
    id: '42',
    type: FormType.WATER_ANALYSIS,
    title: 'Análise de Água',
    code: 'F01.08-CQ',
    revision: '05',
    emission: '12/05/2024',
    icon: 'fa-faucet-drip',
    color: 'bg-blue-500'
  },
  {
    id: '43',
    type: FormType.WATER_TREATMENT,
    title: 'Tratamento de Água',
    code: 'F01.09-CQ',
    revision: '04',
    emission: '12/05/2024',
    icon: 'fa-filter',
    color: 'bg-cyan-600'
  },
  {
    id: '44',
    type: FormType.CERTIFICATE_OF_ANALYSIS,
    title: 'Certificado de Análises (COA)',
    code: 'COA',
    revision: '00',
    emission: '27/03/2026',
    icon: 'fa-certificate',
    color: 'bg-amber-600'
  },
  {
    id: '45',
    type: FormType.FRUIT_REGISTRATION,
    title: 'Cadastro de Frutas',
    code: 'CAD-FRUTA',
    revision: '01',
    emission: '07/05/2026',
    icon: 'fa-apple-whole',
    color: 'bg-green-700'
  }
];
