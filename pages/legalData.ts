export interface ComparisonRow {
  permission: string;
  personal: string;
  personalStatus: 'yes' | 'no' | 'custom' | 'none';
  studio: string;
  studioStatus: 'yes' | 'no' | 'custom' | 'none';
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    permission: 'Who is it for?',
    personal: 'Solo developers, freelance artists, hobbyists',
    personalStatus: 'yes',
    studio: 'Studios, companies, teams of 2+ people',
    studioStatus: 'yes',
  },
  {
    permission: 'Allowed Seats (Access to source 3D files)',
    personal: 'Strictly 1 person',
    personalStatus: 'yes',
    studio: 'Unlimited within the licensed company',
    studioStatus: 'yes',
  },
  {
    permission: 'Commercial Video Games (Steam, App Store, Consoles)',
    personal: 'Unlimited (Royalty-free)',
    personalStatus: 'yes',
    studio: 'Unlimited (Royalty-free)',
    studioStatus: 'yes',
  },
  {
    permission: 'Number of Commercial Products',
    personal: 'Unlimited projects',
    personalStatus: 'yes',
    studio: 'Unlimited projects',
    studioStatus: 'yes',
  },
  {
    permission: 'Revenue Limit / Cap',
    personal: 'None (Keep 100% of your earnings)',
    personalStatus: 'none',
    studio: 'None (Keep 100% of your earnings)',
    studioStatus: 'none',
  },
  {
    permission: 'Modify Geometry, Textures, Shaders, Rigs',
    personal: 'Permitted',
    personalStatus: 'yes',
    studio: 'Permitted',
    studioStatus: 'yes',
  },
  {
    permission: 'Renders, Cinematics, YouTube & Commercial Trailers',
    personal: 'Permitted',
    personalStatus: 'yes',
    studio: 'Permitted',
    studioStatus: 'yes',
  },
  {
    permission: 'Client Work (Delivering compiled games/videos)',
    personal: 'Permitted',
    personalStatus: 'yes',
    studio: 'Permitted',
    studioStatus: 'yes',
  },
  {
    permission: 'Client Work (Delivering raw/editable project files)',
    personal: 'Client must own a separate license',
    personalStatus: 'no',
    studio: "Permitted for studio's contracted client",
    studioStatus: 'yes',
  },
  {
    permission: 'Team-wide Storage (Shared Git/Server/Cloud Drive)',
    personal: 'Forbidden (Local device only)',
    personalStatus: 'no',
    studio: 'Permitted on secure private servers',
    studioStatus: 'yes',
  },
  {
    permission: '3D Printing (Personal display)',
    personal: 'Permitted (Non-commercial only)',
    personalStatus: 'yes',
    studio: 'Permitted (Non-commercial only)',
    studioStatus: 'yes',
  },
  {
    permission: 'Commercial 3D Printing / Physical Toys / Merch',
    personal: 'Requires Custom License',
    personalStatus: 'custom',
    studio: 'Requires Custom License',
    studioStatus: 'custom',
  },
  {
    permission: 'AI / Machine Learning / Dataset Training',
    personal: 'Strictly Forbidden',
    personalStatus: 'no',
    studio: 'Strictly Forbidden',
    studioStatus: 'no',
  },
  {
    permission: 'Resell / Share / Re-distribute Standalone 3D Assets',
    personal: 'Strictly Forbidden',
    personalStatus: 'no',
    studio: 'Strictly Forbidden',
    studioStatus: 'no',
  },
];

export interface KeyPoint {
  id: string;
  badge: string;
  title: string;
  color: string;
  items: string[];
}

export const KEY_POINTS: KeyPoint[] = [
  {
    id: 'personal',
    badge: 'Single-Seat',
    title: '1. Personal License',
    color: 'blue',
    items: [
      'Made for solo indie developers, solo freelancers, and individual creators.',
      'You can release as many commercial games, apps, or animations as you want and keep 100% of your profits with zero royalties.',
      'Only you may install and access the raw .blend, .fbx, or texture files. You cannot share raw files with teammates.',
    ],
  },
  {
    id: 'studio',
    badge: 'Multi-Seat',
    title: '2. Studio / Company License',
    color: 'purple',
    items: [
      'Made for teams, studios, companies, and agencies of 2 or more people.',
      'You can host the assets on your private Git, SVN, Perforce, or cloud storage for all authorized studio artists and programmers.',
      'Covers unlimited studio projects and client deliverables.',
    ],
  },
  {
    id: 'prohibited',
    badge: 'Strict Rules',
    title: '3. Strictly Prohibited (Requires Custom License)',
    color: 'pink',
    items: [
      'No Standalone Resale: You cannot re-upload our assets to other stores, asset marketplaces, torrents, or Discord servers.',
      'No Extraction: Your game builds must be compiled (e.g. packaged Unreal or Unity builds) so players cannot rip raw 3D files.',
      'No AI Training: Assets may not be used to train, fine-tune, or benchmark AI/generative models.',
      'No Commercial Physical Goods: Commercial 3D printing and physical manufacturing are strictly prohibited without a separate contract.',
    ],
  },
];

export interface EulaSection {
  number: number;
  id: string;
  title: string;
  content: {
    intro?: string;
    subsections?: {
      subtitle?: string;
      text: string;
      bullets?: string[];
    }[];
    bullets?: string[];
  };
}

export const EULA_SECTIONS: EulaSection[] = [
  {
    number: 1,
    id: 'definitions',
    title: 'Definitions',
    content: {
      subsections: [
        {
          subtitle: '1.1 Asset',
          text: '“Asset” means any digital content created and made available by Mnostva Art, including but not limited to 3D models, meshes, geometry, textures, materials, shaders, rigs, animations, environment kits, props, characters, prefabs, particle effects, source files (including .blend, .fbx, .obj, .gltf, or engine-specific packages), project files, and associated technical documentation.',
        },
        {
          subtitle: '1.2 Digital Product / Final Product',
          text: '“Product” or “Final Product” means a finished, integrated digital work created or controlled by the Licensee (such as a video game, interactive software, mobile application, virtual or augmented reality experience, digital film, cinematic, animation, broadcast, architectural visualization, or digital marketing material) in which the Assets are incorporated as an inseparable, embedded component, and where raw source Asset files cannot be extracted, retrieved, or separated by end users in the ordinary course of use.',
        },
        {
          subtitle: '1.3 Personal License (Single Seat)',
          text: '“Personal License” means a single-user license granted strictly to one (1) natural person (individual creator, solo developer, freelancer, or hobbyist). The Personal License permits that individual to use the Assets across unlimited personal, educational, commercial, and client digital Products. A Personal License is strictly tied to the individual purchaser and does not permit sharing, pooling, or hosting the source Assets for access by other team members, studios, or companies.',
        },
        {
          subtitle: '1.4 Studio / Company License (Multi-Seat)',
          text: '“Studio / Company License” means a multi-user entity license granted to a commercial studio, company, corporation, partnership, educational institution, or team consisting of two (2) or more collaborators. A Studio / Company License permits the Licensee to store the Assets on secure internal systems and make them accessible to its authorized employees and contractors solely for the creation, development, testing, and marketing of Products owned and controlled by the Licensee.',
        },
        {
          subtitle: '1.5 Authorized Team Member',
          text: '“Authorized Team Member” means an internal employee or dedicated third-party contractor directly engaged by a Studio / Company Licensee to work on Products controlled by that Licensee.',
        },
      ],
    },
  },
  {
    number: 2,
    id: 'ownership',
    title: 'Ownership and Intellectual Property',
    content: {
      subsections: [
        {
          subtitle: '2.1 Licensed, Not Sold',
          text: 'All Assets are licensed, not sold. Purchasing an Asset does not transfer copyright, moral rights, patent rights, trademark rights, trade secrets, or any other intellectual property ownership to the Licensee.',
        },
        {
          subtitle: '2.2 Retention of Rights',
          text: 'Mnostva Art retains all right, title, interest, and intellectual property rights in and to the Assets, including all source files, artistic representations, 3D meshes, UV maps, textures, and any updates or revisions, except for the limited usage rights expressly granted under this Agreement.',
        },
        {
          subtitle: '2.3 Modifications',
          text: 'The Licensee may freely modify, adapt, retopologize, retexture, rig, or optimize the Assets for integration into their Products. Any modification or derivative work based on the Assets remains subject to Mnostva Art’s underlying copyright and does not grant the Licensee independent, transferable copyright ownership in the underlying 3D geometry or artistic design.',
        },
      ],
    },
  },
  {
    number: 3,
    id: 'license-grant',
    title: 'License Grant',
    content: {
      intro: 'Subject to full payment of the applicable fee and ongoing compliance with this Agreement, Mnostva Art grants the Licensee a worldwide, non-exclusive, perpetual, royalty-free, non-transferable, and non-sublicensable license to use the purchased Assets in accordance with the purchased tier:',
      subsections: [
        {
          subtitle: '3.1 Personal License (Single-Seat / Solo Creators)',
          text: 'A Personal License authorizes strictly one (1) natural person to:',
          bullets: [
            'Download, install, and store the Assets on devices owned or exclusively controlled by the Licensee;',
            'Create reasonable local backup copies for personal archival purposes;',
            'Use the Assets in an unlimited number of commercial, indie, freelance, personal, and educational digital Products;',
            'Modify, adapt, animate, and incorporate the Assets into compiled, binary-format Products;',
            'Distribute, market, broadcast, monetize, and sell commercial Products containing the Assets;',
            'Use the Assets to perform contracted work for clients, provided the Assets are delivered strictly as part of a compiled, non-extractable Final Product.',
            'Restriction: The Personal License does not authorize simultaneous or shared access by other individuals. If two or more people need access to the raw Asset files, a Studio / Company License is required.',
          ],
        },
        {
          subtitle: '3.2 Studio / Company License (Multi-Seat / Studios & Teams)',
          text: 'A Studio / Company License grants all rights of the Personal License, and additionally authorizes a legal entity or multi-person team to:',
          bullets: [
            'Store the Assets in a secure, access-controlled internal repository, private server, cloud storage, or version-control system (e.g., Git, SVN, Perforce) accessible exclusively by Authorized Team Members;',
            'Allow internal employees and third-party contractors to download, access, and use the Assets solely for the creation and delivery of Products controlled by the Licensee;',
            'Use the Assets across an unlimited number of commercial studio projects and client deliverables;',
            'Deploy the Assets in team-based production pipelines without restriction on the number of internal seats within the licensed legal entity.',
            'Restriction: Authorized Team Members and contractors receive no independent personal ownership or transferable license. Their access exists solely while working on the Licensee’s authorized Products. Upon completion of their engagement, contractors must permanently delete all raw Asset files from their personal hardware.',
          ],
        },
      ],
    },
  },
  {
    number: 4,
    id: 'commercial-use',
    title: 'Commercial Use & Monetization',
    content: {
      bullets: [
        'Commercial use and monetization are permitted under both Personal and Studio / Company Licenses.',
        'The Licensee may sell, distribute, monetize via microtransactions, subscriptions, advertisements, paid downloads, crowdfunding, or streaming any digital Product incorporating the Assets.',
        'No ongoing royalties, revenue-share percentages, or recurring licensing fees are owed to Mnostva Art from sales or revenues generated by your Products.',
        'There is no limit on the number of commercial digital Products you may publish under a valid license.',
      ],
    },
  },
  {
    number: 5,
    id: 'client-work',
    title: 'Client Work and Freelance Services',
    content: {
      subsections: [
        {
          subtitle: '5.1 Delivering Final Products to Clients',
          text: 'The Licensee may use the Assets to create digital Products for third-party clients. If the client receives solely a compiled, rendered, or protected binary deliverable (e.g., an executable video game, a pre-rendered cinematic, an architectural walk-through video, or rendered marketing images), no additional license is required for the client.',
        },
        {
          subtitle: '5.2 Delivering Open Source / Project Files to Clients',
          text: 'If a client contractually requires the delivery of editable 3D source files, raw asset packages, or open editable game engine projects (e.g., an editable Unreal Engine or Unity project file containing raw Mnostva Art assets), the client itself must purchase an appropriate License (Personal or Studio / Company) prior to receiving the editable source files. A freelancer\'s Personal License cannot be transferred or sublicensed to a client to grant that client independent asset ownership.',
        },
      ],
    },
  },
  {
    number: 6,
    id: 'modifications',
    title: 'Permitted Modifications',
    content: {
      bullets: [
        'You may freely edit meshes, modify UV layouts, customize materials and shaders, retexture, rig, animate, optimize polycounts, combine Assets with other third-party content, and produce derivative 3D variations for use within your Products.',
        'Modified Assets remain subject to all terms and restrictions of this Agreement.',
        'Modification does not grant you the right to sell, distribute, or license the modified 3D model, mesh, or texture as a standalone digital asset, kitbash set, template, or downloadable stock asset.',
      ],
    },
  },
  {
    number: 7,
    id: 'prohibited-uses',
    title: 'Strictly Prohibited Uses',
    content: {
      intro: 'Except where expressly authorized in writing by Mnostva Art under a separate Custom License Agreement, the Licensee MUST NOT:',
      subsections: [
        {
          subtitle: '7.1 Standalone Resale or Redistribution',
          text: 'Sell, resell, sublicense, rent, lease, donate, publish, upload, host, share, or otherwise make the Assets available in standalone format. This includes uploading Assets to 3D marketplaces, stock asset libraries, asset stores, public Git repositories, torrent networks, file-sharing platforms, cloud drives, or community communication channels (e.g., Discord, Telegram).',
        },
        {
          subtitle: '7.2 Competing Digital Asset Products',
          text: 'Use any Asset (in original or modified form) to create, market, or distribute a competing 3D model pack, environment kit, prop pack, stylized asset library, texture pack, brush set, shader library, or game template whose primary commercial value is the provision of 3D assets or source content to third parties.',
        },
        {
          subtitle: '7.3 Unprotected / Extractable Distribution',
          text: 'Include the Assets in any software, game, application, or package where the raw 3D meshes, textures, or source files can be easily extracted, decompiled, or retrieved by end users in standard interchangeable 3D formats (such as .fbx, .obj, .gltf, .blend, .png). Assets distributed within game builds must be compiled, cooked, or packaged into protected engine binary archives (such as Unreal .pak/.ucas, Unity .assets/AssetBundles, or encrypted archives).',
        },
        {
          subtitle: '7.4 Open UGC Platforms & Virtual Worlds',
          text: 'Upload the Assets to User-Generated Content (UGC) platforms, virtual worlds, or metaverse sandboxes (including but not limited to Roblox, VRChat, Fortnite UEFN, Decentraland, Core, or Garry’s Mod) in a manner that makes the Asset freely cloneable, exportable, or downloadable by other users into their private inventories, toolboxes, or local systems. Incorporating Assets into UGC games is permitted solely as a locked, non-cloneable, non-extractable part of an immutable published environment/experience.',
        },
        {
          subtitle: '7.5 Commercial 3D Printing and Physical Goods',
          text: '3D printing of the Assets is permitted solely for personal, non-commercial, private display by the Licensee. You must not commercially manufacture, cast, mold, mass-produce, 3D-print for sale, or distribute physical goods, miniatures, toys, figurines, board game components, merchandise, or physical collectibles derived from the Assets. Any commercial physical production is strictly prohibited and requires a separate Custom License.',
        },
        {
          subtitle: '7.6 Generative AI, Machine Learning, and Dataset Training',
          text: 'The Assets (and any derivatives) must not be used, directly or indirectly, as training data, fine-tuning inputs, validation benchmarks, embeddings, feature libraries, or reference material for any artificial intelligence, machine learning, deep learning, neural network, or generative model (including 3D generative AI, image-to-3D, text-to-3D, latent diffusion models, or NeRF/Gaussian Splatting systems). Automated scraping, data extraction, systematic crawling, or ingestion of the Assets into any AI training pipeline is strictly prohibited. Pursuant to Article 4(3) of Directive (EU) 2019/790 of the European Parliament and of the Council on copyright and related rights in the Digital Single Market, Mnostva Art expressly reserves all rights regarding text and data mining (TDM) and automated data extraction of its content and Assets.',
        },
        {
          subtitle: '7.7 NFTs and Blockchain Tokenization',
          text: 'You may not mint, tokenize, sell, or distribute any Asset, modified asset, render, or derivative work as a standalone Non-Fungible Token (NFT), tokenized digital collectible, or blockchain-based virtual item.',
        },
        {
          subtitle: '7.8 Authorship Misrepresentation & Notice Removal',
          text: 'You may not claim that you or any third party created, authored, or holds copyright in the original 3D artistic geometry, designs, or textures of the Assets, nor may you remove, alter, or obscure any copyright notices, watermarks, metadata, or proprietary markings provided with the Assets.',
        },
        {
          subtitle: '7.9 Unlawful and Harmful Purposes',
          text: 'You may not use the Assets for any unlawful purpose, in violation of applicable laws, or in any defamatory, hateful, or infringing context.',
        },
      ],
    },
  },
  {
    number: 8,
    id: 'renders',
    title: 'Renders, Cinematics, and Visual Media',
    content: {
      bullets: [
        'The Licensee is fully authorized to render 2D images, video animations, cinematics, promotional trailers, gameplay recordings, screenshots, virtual production sequences, and advertising materials incorporating the Assets.',
        'Rendered audiovisual outputs may be commercially distributed, monetized, and broadcast across any media channel (including YouTube, Twitch, television, digital streaming, and print advertising).',
        'The Licensee may not sell or license standalone 2D renders as stock imagery, stock textures, or stock footage where the primary purpose of the product is to provide the visual asset itself for third-party reuse.',
      ],
    },
  },
  {
    number: 9,
    id: 'compatibility',
    title: 'Game Engines and Software Compatibility',
    content: {
      bullets: [
        'The Assets may be imported and utilized in any compatible digital content creation (DCC) software and game engines, including but not limited to Unity, Unreal Engine, Godot, Blender, Autodesk Maya, 3ds Max, Cinema 4D, and proprietary in-house engines.',
        'Use is not restricted to any specific engine version or operating system.',
        'Mnostva Art does not warrant that Assets will remain compatible with future unreleased versions of third-party software or engines.',
      ],
    },
  },
  {
    number: 10,
    id: 'free-assets',
    title: 'Free Assets Policy',
    content: {
      intro: 'Assets clearly designated as “Free Assets” on the Mnostva Art website or official store channels are provided under the terms of the Personal License, subject to the following clarifications:',
      bullets: [
        'Free Assets may be incorporated into both commercial and non-commercial compiled digital Products.',
        'Standalone redistribution of Free Assets (even if offered for free or bundled with other free materials) is strictly prohibited. You may not re-host or re-upload our free files to other forums, drives, or websites.',
        'Free Assets are subject to the same strict prohibitions regarding AI model training, commercial 3D printing, and standalone redistribution as paid Assets.',
        'Mnostva Art reserves the right to modify or withdraw Free Assets from distribution at its sole discretion.',
      ],
    },
  },
  {
    number: 11,
    id: 'multiple-projects',
    title: 'Multiple Projects & No Automatic Upgrade',
    content: {
      bullets: [
        'Multiple Projects: A single valid license permits the Licensee to utilize the purchased Asset in an unlimited number of discrete digital Products (e.g., in multiple games, updates, sequels, or marketing campaigns).',
        'No Repurchase on Team Growth: Rights granted at the time of purchase remain valid indefinitely for that purchase. If a Licensee purchases a Personal License as a solo creator and later establishes a team or company, the Licensee is not required to repurchase the Asset for previously created Products, provided that raw source file access remains restricted to the original single individual. Any ongoing collaborative team access to source files requires upgrading to a Studio / Company License.',
      ],
    },
  },
  {
    number: 12,
    id: 'digital-delivery',
    title: 'Digital Delivery, Access, and Consumer Rights (EU / Portugal)',
    content: {
      subsections: [
        {
          subtitle: '12.1 Digital Delivery',
          text: 'Assets are delivered electronically via digital download links or user account dashboards immediately upon confirmed payment. Mnostva Art does not guarantee permanent server availability for re-downloading files indefinitely; Licensees are strongly advised to maintain secure local archival backups of purchased files.',
        },
        {
          subtitle: '12.2 Right of Withdrawal Waiver (EU Consumers)',
          text: 'If you are an individual consumer residing in the European Union, you expressly acknowledge that under applicable consumer protection legislation (including Portuguese Decree-Law no. 24/2014, transposing EU Directive 2011/83/EU on Consumer Rights), the statutory 14-day right of withdrawal from the contract ceases once the supply of digital content has begun with your prior express consent and acknowledgment that you thereby lose your right of withdrawal.',
        },
        {
          subtitle: '12.3 Refunds',
          text: 'Due to the digital and intangible nature of downloadable software, all sales are final once downloaded or accessed, except where mandated by mandatory statutory consumer protection laws (e.g., where an Asset possesses a demonstrable, irreparable technical defect that renders it fundamentally inconsistent with its advertised description and our support team cannot rectify the issue within a reasonable timeframe).',
        },
        {
          subtitle: '12.4 Chargebacks and Reversed Payments',
          text: 'If a payment for an Asset is disputed, charged back, reversed, or refunded, the license granted for that Asset is immediately and automatically terminated. The Licensee must immediately delete all copies of the affected Asset and cease incorporating it into any current or future Products.',
        },
      ],
    },
  },
  {
    number: 13,
    id: 'warranties',
    title: 'Warranties and Disclaimer',
    content: {
      bullets: [
        '“As Is” Disclaimer: To the maximum extent permitted by applicable law, the Assets are provided on an “AS IS” and “AS AVAILABLE” basis, with all faults and without warranty of any kind.',
        'Mnostva Art disclaims all warranties, express, implied, statutory, or otherwise, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, quiet enjoyment, and system integration.',
        'Mnostva Art does not warrant that the operation of the Assets will be uninterrupted, error-free, compatible with all hardware and software configurations, or that defects will be corrected.',
      ],
    },
  },
  {
    number: 14,
    id: 'liability',
    title: 'Limitation of Liability',
    content: {
      bullets: [
        'To the maximum extent permitted by applicable law, in no event shall Mnostva Art, its creator, employees, contractors, or affiliates be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including but not limited to loss of profits, lost revenue, loss of goodwill, data corruption, business interruption, or computer failure, arising out of or in connection with the use or inability to use the Assets.',
        'In all circumstances, Mnostva Art’s aggregate cumulative liability arising out of or related to this Agreement or the Assets, whether in contract, tort (including negligence), or otherwise, shall be strictly limited to the amount actually paid by the Licensee for the specific Asset giving rise to the claim.',
        'Nothing in this Agreement excludes or limits liability that cannot lawfully be excluded under mandatory applicable consumer protection law.',
      ],
    },
  },
  {
    number: 15,
    id: 'indemnification',
    title: 'Indemnification',
    content: {
      intro: 'To the extent permitted by applicable law, the Licensee agrees to defend, indemnify, and hold harmless Mnostva Art, its owner, agents, and representatives from and against any third-party claims, liabilities, losses, damages, costs, and legal fees arising out of or resulting from the Licensee’s material breach of this Agreement, unauthorized redistribution of the Assets, or unlawful use of Products created using the Assets.',
    },
  },
  {
    number: 16,
    id: 'termination',
    title: 'Breach and Termination',
    content: {
      subsections: [
        {
          subtitle: '16.1 Termination for Cause',
          text: 'This Agreement and the licenses granted hereunder will terminate automatically without notice if the Licensee fails to comply with any material term or condition of this Agreement.',
        },
        {
          subtitle: '16.2 Post-Termination Obligations',
          text: 'Upon termination for breach, the Licensee must immediately cease all access, use, and distribution of the Assets; permanently delete and destroy all standalone copies stored on devices, cloud accounts, repositories, and servers; and take reasonable steps to prevent further unauthorized dissemination.',
        },
        {
          subtitle: '16.3 Surviving Products',
          text: 'Provided that the Licensee’s breach did not involve the unlawful distribution of the Product itself, digital Products that were lawfully compiled, published, and distributed to end users prior to termination may remain in circulation, provided the raw Assets cannot be extracted.',
        },
      ],
    },
  },
  {
    number: 17,
    id: 'custom-licenses',
    title: 'Custom & Extended Licenses',
    content: {
      intro: 'If you wish to use the Assets in any manner outside the scope of this standard EULA, including:',
      bullets: [
        'Commercial 3D printing, toy manufacturing, or physical merchandise production;',
        'AI / Machine Learning model training, dataset inclusion, or synthetic data generation;',
        'Film, television, or broadcast IP franchise licensing;',
        'Inclusion in open UGC toolkits, modding software, or building kits;',
        'Custom corporate enterprise indemnification;',
      ],
      subsections: [
        {
          text: 'You must obtain a written, bilaterally executed Custom License Agreement from Mnostva Art. Inquiries must be submitted to support@mnostva.art. Standard checkout purchases do not convey any extended or physical rights.',
        },
      ],
    },
  },
  {
    number: 18,
    id: 'governing-law',
    title: 'Governing Law and Jurisdiction',
    content: {
      subsections: [
        {
          subtitle: '18.1 Governing Law',
          text: 'This Agreement is governed by and construed in accordance with the laws of Portugal, without giving effect to any conflict of law principles that would result in the application of the laws of another jurisdiction. The United Nations Convention on Contracts for the International Sale of Goods (CISG) is expressly excluded.',
        },
        {
          subtitle: '18.2 B2B Jurisdiction',
          text: 'For business-to-business transactions, the parties submit to the exclusive jurisdiction of the competent courts of Lisbon, Portugal, to resolve any dispute, controversy, or claim arising out of or relating to this Agreement.',
        },
        {
          subtitle: '18.3 B2C Consumer Protection',
          text: 'For transactions with individual consumers, this choice of law does not deprive the consumer of the protection afforded to them by mandatory provisions of the law of the country where the consumer has their habitual residence, nor does it restrict statutory consumer rights regarding venue.',
        },
        {
          subtitle: '18.4 Good Faith Negotiation',
          text: 'Before commencing formal legal proceedings, the parties agree to make a bona fide attempt to resolve any dispute through amicable, direct communication for at least thirty (30) days.',
        },
      ],
    },
  },
  {
    number: 19,
    id: 'miscellaneous',
    title: 'Miscellaneous',
    content: {
      subsections: [
        {
          subtitle: '19.1 Entire Agreement',
          text: 'This Agreement, together with the specific product listing page and applicable checkout terms, constitutes the sole and entire agreement between the parties regarding the Assets and supersedes all prior understandings, representations, and communications.',
        },
        {
          subtitle: '19.2 Severability',
          text: 'If any provision of this Agreement is held to be invalid, unlawful, or unenforceable, the remaining provisions shall remain in full force and effect, and the invalid provision shall be enforced to the maximum extent permissible under applicable law to reflect the original commercial intent.',
        },
        {
          subtitle: '19.3 No Waiver',
          text: 'No failure or delay by Mnostva Art in exercising any right, power, or remedy under this Agreement shall operate as a waiver thereof.',
        },
        {
          subtitle: '19.4 Assignment',
          text: 'The Licensee may not assign, transfer, or sublicense this Agreement or any rights granted hereunder without Mnostva Art’s prior written consent. A corporate restructuring or merger does not invalidate a Studio / Company License, provided the Assets continue to be used strictly within the scope of this Agreement.',
        },
      ],
    },
  },
  {
    number: 20,
    id: 'contact',
    title: 'Contact & Infringement Inquiries',
    content: {
      intro: 'For licensing questions, permissions, custom licensing, or legal notices:',
      bullets: [
        'Legal & Licensing Inquiries: support@mnostva.art',
        'Copyright & DMCA Takedown Notices: support@mnostva.art',
        'Official Website: https://mnostva.art',
      ],
    },
  },
];
