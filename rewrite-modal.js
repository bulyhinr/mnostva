const fs = require('fs');

const path = 'components/ProductModal.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Change layout wrappers
code = code.replace(
  '<div className="flex flex-col lg:flex-row">',
  '<div className="flex flex-col">'
);

code = code.replace(
  '<div className="lg:w-3/5 p-8 lg:p-12">',
  '<div className="lg:sticky lg:top-0 z-20 bg-white p-6 md:p-8 lg:p-10 border-b-4 border-gray-100 shrink-0">'
);

code = code.replace(
  'aspect-video lg:aspect-square mb-8 group',
  'aspect-video lg:aspect-[21/9] max-h-[50vh] mb-6 group max-w-5xl mx-auto'
);

code = code.replace(
  '<div className="grid grid-cols-4 gap-4 mb-8">',
  '<div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar max-w-5xl mx-auto">'
);

code = code.replace(
  'className={`aspect-square rounded-2xl overflow-hidden',
  'className={`w-24 md:w-32 shrink-0 aspect-square snap-start rounded-2xl overflow-hidden'
);

// We need to move the Pack Content & Compatibility out of the top section and into the left column of the new bottom section.
// The split point is:
const splitPoint = `            <div className="lg:w-2/5 p-8 lg:p-12 bg-gray-50/50 lg:border-l border-gray-100 flex flex-col">`;
const newBottomStart = `
            </div> {/* End Top Gallery */}

            {/* Bottom Content Section */}
            <div className="p-6 md:p-8 lg:p-12 bg-gray-50/50 flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Left Column */}
              <div className="lg:w-3/5 flex flex-col space-y-8">
`;

// Let's manually replace the bottom structure. It's better to provide a whole new component structure for the bottom.
