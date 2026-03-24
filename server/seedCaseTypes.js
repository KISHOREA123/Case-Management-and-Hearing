const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { CaseType } = require('./models');

dotenv.config();

const caseTypes = [
    {
        name: 'Civil Dispute',
        description: 'Legal cases involving disputes between individuals or organizations over rights, property, contracts, or compensation.'
    },
    {
        name: 'Criminal Case',
        description: 'Cases involving violations of criminal law where the state prosecutes an individual or organization for committing a crime.'
    },
    {
        name: 'Family Law',
        description: 'Cases related to family matters such as divorce, child custody, adoption, domestic violence, and maintenance.'
    },
    {
        name: 'Property Dispute',
        description: 'Legal disputes regarding ownership, transfer, inheritance, or possession of land, buildings, or other real estate.'
    },
    {
        name: 'Corporate Law',
        description: 'Cases involving business entities, company regulations, shareholder disputes, mergers, compliance, and corporate governance.'
    },
    {
        name: 'Labour Law',
        description: 'Cases related to employment disputes such as wrongful termination, workplace discrimination, employee rights, and wage disputes.'
    },
    {
        name: 'Consumer Protection',
        description: 'Cases where consumers file complaints against businesses for defective products, unfair trade practices, or service deficiencies.'
    },
    {
        name: 'Tax Law',
        description: 'Legal matters involving tax disputes, tax evasion, compliance issues, and appeals against tax assessments.'
    },
    {
        name: 'Intellectual Property',
        description: 'Cases involving protection of intellectual assets such as trademarks, copyrights, patents, and trade secrets.'
    },
    {
        name: 'Contract Dispute',
        description: 'Legal disputes arising from breach of contract, failure to fulfill contractual obligations, or disagreement over contract terms.'
    },
    {
        name: 'Cyber Crime',
        description: 'Cases involving online crimes such as hacking, identity theft, online fraud, cyber harassment, and data breaches.'
    },
    {
        name: 'Environmental Law',
        description: 'Legal cases related to environmental protection, pollution control, and violations of environmental regulations.'
    },
    {
        name: 'Banking & Finance',
        description: 'Cases involving banking disputes, loan defaults, financial fraud, and regulatory compliance.'
    },
    {
        name: 'Insurance Claims',
        description: 'Disputes involving insurance coverage, policy interpretation, claim rejection, or compensation.'
    },
    {
        name: 'Real Estate Law',
        description: 'Legal issues related to property development, construction disputes, property transactions, and land use regulations.'
    }
];

const seedCaseTypes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding Case Types...');

        for (const type of caseTypes) {
            const exists = await CaseType.findOne({ name: type.name });
            if (!exists) {
                await CaseType.create(type);
                console.log(`Added: ${type.name}`);
            } else {
                console.log(`Skipped (already exists): ${type.name}`);
            }
        }

        console.log('Case types seeding completed!');
        process.exit();
    } catch (error) {
        console.error('Error seeding case types:', error);
        process.exit(1);
    }
};

seedCaseTypes();
