import { db } from '@/db';
import { ngos } from '@/db/schema';

async function main() {
    const sampleNgos = [
        {
            name: 'Instituto Ayrton Senna',
            description: 'Organização que atua para ampliar oportunidades de crianças e jovens através de educação de qualidade',
            logoUrl: '/logos/instituto-ayrton-senna.png',
            minMiles: 100,
            ods: '4, 8, 10',
            active: true,
            createdAt: Date.now(),
        },
        {
            name: 'Ação da Cidadania',
            description: 'Combate à fome e à miséria, promovendo a inclusão social e a cidadania',
            logoUrl: '/logos/acao-da-cidadania.png',
            minMiles: 50,
            ods: '1, 10',
            active: true,
            createdAt: Date.now(),
        },
        {
            name: 'Geração Empreendedora',
            description: 'Formação de jovens empreendedores de baixa renda, conectando-os ao mercado de trabalho',
            logoUrl: '/logos/geracao-empreendedora.png',
            minMiles: 100,
            ods: '4, 8, 10',
            active: true,
            createdAt: Date.now(),
        },
        {
            name: 'Observatório do Clima',
            description: 'Rede que reúne entidades da sociedade civil para discutir mudanças climáticas no Brasil',
            logoUrl: '/logos/observatorio-do-clima.png',
            minMiles: 150,
            ods: '13',
            active: true,
            createdAt: Date.now(),
        },
        {
            name: 'Pastoral da Criança',
            description: 'Organismo de ação social que trabalha pelo desenvolvimento integral de crianças em situação de vulnerabilidade',
            logoUrl: '/logos/pastoral-da-crianca.png',
            minMiles: 50,
            ods: '1, 4, 10',
            active: true,
            createdAt: Date.now(),
        },
    ];

    // Insere apenas o que ainda nao existe, para o seed poder rodar mais de uma vez
    // sem duplicar as ONGs.
    const existing = await db.select({ name: ngos.name }).from(ngos);
    const existingNames = new Set(existing.map((ngo) => ngo.name));
    const missing = sampleNgos.filter((ngo) => !existingNames.has(ngo.name));

    if (missing.length === 0) {
        console.log('✅ NGOs ja estavam cadastradas, nada a fazer');
        return;
    }

    await db.insert(ngos).values(missing);

    console.log(`✅ NGOs seeder completed successfully (${missing.length} inseridas)`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
});