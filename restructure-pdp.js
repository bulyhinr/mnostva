const fs = require('fs');

let content = fs.readFileSync('pages/ProductDetailPage.tsx', 'utf8');

// The main layout wrapper
const layoutStart = '<div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border-b-8 border-black/10">';

// 1. Top Gallery Section
const galleryStart = '{/* Top Gallery Section (Sticky on desktop) */}';
const galleryEnd = '{/* Bottom Content Section */}';

let galleryBlock = content.substring(
  content.indexOf(galleryStart),
  content.indexOf(galleryEnd)
);
// remove sticky classes from gallery
galleryBlock = galleryBlock.replace('lg:sticky lg:top-0 z-20 bg-white pb-8 md:pb-12 border-b-4 border-gray-100 shrink-0', '');
galleryBlock = galleryBlock.replace('mb-8 bg-gray-100', 'mb-6 bg-gray-100'); // tighten gap
galleryBlock = galleryBlock.replace('max-w-7xl mx-auto', ''); // remove mx-auto
galleryBlock = galleryBlock.replace('<div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar max-w-7xl mx-auto">', '<div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar">');

// 2. Left Column (Info)
const leftColStart = '{/* Left Column (Info) */}';
const rightColStart = '{/* Right Column (Purchase & Specs) */}';

let infoBlock = content.substring(
  content.indexOf(leftColStart) + leftColStart.length,
  content.indexOf(rightColStart)
);
// strip out the wrapper
infoBlock = infoBlock.replace('<div className="lg:w-3/5 flex flex-col space-y-10">', '');
// remove the last </div> before rightColStart
let lastDivIndex = infoBlock.lastIndexOf('</div>');
infoBlock = infoBlock.substring(0, lastDivIndex) + infoBlock.substring(lastDivIndex + 6);

// 3. Right Column (Purchase & Specs)
const scrollRevealEnd = '</ScrollReveal>';
let rightColBlock = content.substring(
  content.indexOf(rightColStart),
  content.lastIndexOf(scrollRevealEnd)
);

// We need to cut rightColBlock before the closing tags of the main layout wrapper
// Let's just find the last few </div>s
const closingTags = '</div>\n          </div>\n        </div>\n      </ScrollReveal>';
rightColBlock = rightColBlock.replace(closingTags, '');
rightColBlock = rightColBlock.replace('<div className="lg:w-2/5 flex flex-col">', '<div className="flex flex-col lg:sticky lg:top-8">'); // make it sticky

// Construct the new layout
const newLayout = `
        <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border-b-8 border-black/10 p-6 md:p-10 lg:p-12">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            
            {/* Left Column: Gallery + Info */}
            <div className="lg:w-[55%] flex flex-col space-y-10">
              <div className="flex flex-col">
                ${galleryBlock.replace('{/* Top Gallery Section (Sticky on desktop) */}', '')}
              </div>
              
              <div className="flex flex-col space-y-10">
                ${infoBlock}
              </div>
            </div>

            {/* Right Column: Sticky Buy Box */}
            <div className="lg:w-[45%] relative">
              ${rightColBlock}
            </div>

          </div>
        </div>
      </ScrollReveal>
`;

const newContent = content.substring(0, content.indexOf(layoutStart)) + newLayout + content.substring(content.lastIndexOf(scrollRevealEnd) + scrollRevealEnd.length);

fs.writeFileSync('pages/ProductDetailPage.tsx', newContent);
console.log('Restructured successfully');
