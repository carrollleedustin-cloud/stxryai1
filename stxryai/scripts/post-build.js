/**
 * Post-build script for Netlify deployments.
 * Performs build verification and generates reports.
 */

const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(process.cwd(), '.next');
const STATIC_DIR = path.join(BUILD_DIR, 'static');

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getDirectorySize(dirPath) {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += stat.size;
      }
    }
  } catch {
    // Directory doesn't exist
  }
  return size;
}

function countFiles(dirPath, extension) {
  let count = 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        count += countFiles(filePath, extension);
      } else if (!extension || file.endsWith(extension)) {
        count++;
      }
    }
  } catch {
    // Directory doesn't exist
  }
  return count;
}

function verifyBuild() {
  console.log('\n📊 Post-build verification...\n');

  // Check if build directory exists
  if (!fs.existsSync(BUILD_DIR)) {
    console.error('❌ Build directory not found. Build may have failed.\n');
    process.exit(1);
  }

  // Build stats
  const buildSize = getDirectorySize(BUILD_DIR);
  const staticSize = getDirectorySize(STATIC_DIR);
  const jsFiles = countFiles(STATIC_DIR, '.js');
  const cssFiles = countFiles(STATIC_DIR, '.css');

  console.log('📁 Build Statistics:');
  console.log(`   Total build size: ${formatBytes(buildSize)}`);
  console.log(`   Static assets: ${formatBytes(staticSize)}`);
  console.log(`   JavaScript files: ${jsFiles}`);
  console.log(`   CSS files: ${cssFiles}`);

  // Check for build manifest
  const buildManifestPath = path.join(BUILD_DIR, 'build-manifest.json');
  if (fs.existsSync(buildManifestPath)) {
    console.log('   ✅ Build manifest present');
  } else {
    console.warn('   ⚠️  Build manifest not found');
  }

  // Check for routes manifest (indicates SSR/ISR pages)
  const routesManifestPath = path.join(BUILD_DIR, 'routes-manifest.json');
  if (fs.existsSync(routesManifestPath)) {
    try {
      const routesManifest = JSON.parse(fs.readFileSync(routesManifestPath, 'utf8'));
      const staticRoutes = routesManifest.staticRoutes?.length || 0;
      const dynamicRoutes = routesManifest.dynamicRoutes?.length || 0;
      console.log(`   Static routes: ${staticRoutes}`);
      console.log(`   Dynamic routes: ${dynamicRoutes}`);
    } catch {
      console.log('   ✅ Routes manifest present');
    }
  }

  // Check prerender manifest for ISR pages
  const prerenderManifestPath = path.join(BUILD_DIR, 'prerender-manifest.json');
  if (fs.existsSync(prerenderManifestPath)) {
    try {
      const prerenderManifest = JSON.parse(fs.readFileSync(prerenderManifestPath, 'utf8'));
      const isrPages = Object.keys(prerenderManifest.routes || {}).length;
      console.log(`   ISR-enabled pages: ${isrPages}`);
    } catch {
      // Ignore parse errors
    }
  }

  // Size warnings
  console.log('\n🔍 Size Analysis:');

  const SIZE_WARNING_THRESHOLD = 500 * 1024; // 500KB
  const SIZE_ERROR_THRESHOLD = 1024 * 1024; // 1MB

  // Check for large JS chunks
  const chunksDir = path.join(STATIC_DIR, 'chunks');
  if (fs.existsSync(chunksDir)) {
    const chunks = fs.readdirSync(chunksDir);
    let largeChunks = 0;

    for (const chunk of chunks) {
      if (chunk.endsWith('.js')) {
        const chunkPath = path.join(chunksDir, chunk);
        const stat = fs.statSync(chunkPath);

        if (stat.size > SIZE_ERROR_THRESHOLD) {
          console.warn(`   ⚠️  Large chunk: ${chunk} (${formatBytes(stat.size)})`);
          largeChunks++;
        } else if (stat.size > SIZE_WARNING_THRESHOLD) {
          console.log(`   📦 ${chunk}: ${formatBytes(stat.size)}`);
        }
      }
    }

    if (largeChunks === 0) {
      console.log('   ✅ No oversized chunks detected');
    }
  }

  // Netlify-specific checks
  if (process.env.NETLIFY) {
    console.log('\n🌐 Netlify Environment:');
    console.log(`   Site: ${process.env.SITE_NAME || 'unknown'}`);
    console.log(`   Deploy URL: ${process.env.DEPLOY_URL || 'unknown'}`);
    console.log(`   Context: ${process.env.CONTEXT || 'unknown'}`);

    if (process.env.CONTEXT === 'production') {
      console.log('   🚀 Production build');
    } else if (process.env.CONTEXT === 'deploy-preview') {
      console.log('   👀 Deploy preview');
    } else {
      console.log('   🔧 Branch deploy');
    }
  }

  console.log('\n✅ Post-build verification complete!\n');
}

// Run verification
verifyBuild();
