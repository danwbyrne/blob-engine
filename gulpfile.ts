// tslint:disable
import gulp from 'gulp';
import path from 'path';
import gulpFilter from 'gulp-filter';
import gulpRename from 'gulp-rename';
import gulpTypescript from 'gulp-typescript';
import fs from 'fs-extra';
import execa from 'execa';
// @ts-ignore
import jsonTransform from 'gulp-json-transform';

interface Format {
  readonly config: string;
}

type BuildFunc = (format: Format) => void;

const packagesPath = path.resolve(__dirname, 'packages');
const basePath = path.resolve(packagesPath, 'blob-engine-');
const specialBuilds: Record<string, BuildFunc | undefined> = {};

const getPackage = (dir: string) => dir.substring(basePath.length);
const getDest = () => path.join('dist', 'packages');

const copyPkgJSON = () => {
  return gulp
    .src(['packages/*/package.json'])
    .pipe(
      jsonTransform((orig: any, _file: any) => ({
        ...orig,
        main: 'index.js',
        devDependencies: {},
      })),
    )
    .pipe(gulp.dest(getDest()));
};

const copyRootPkgJSON = () => {
  return gulp.src('package.json').pipe(gulp.dest('dist'));
};

const copyRootTSConfig = async () => {
  const tsconfigContents = await fs.readFile(path.resolve(__dirname, 'tsconfig.json'), 'utf8');

  const tsconfig = JSON.parse(tsconfigContents);

  const {
    compilerOptions: { paths, typeRoots, ...compilerRest },
    ...configRest
  } = tsconfig;
  const newTSConfig = {
    compilerOptions: {
      paths: {
        [`@blob-engine/*`]: ['./blob-engine-*'],
      },
      ...compilerRest,
    },
    ...configRest,
  };
  const filePath = path.resolve('dist', 'tsconfig.json');
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(newTSConfig, null, 2));
};

const flattenSource = gulpRename((name) => {
  if (name.dirname === undefined) {
    return;
  }
  name.dirname = name.dirname
    .split(path.sep)
    .filter((dir) => dir !== 'src')
    .join(path.sep);
});

const getInitDir = () => {
  const initDir = process.env.INIT_CWD;
  if (initDir === undefined) {
    throw new Error('cant determine package');
  }
  return initDir;
};

const buildDir = getInitDir();
const pkgName = getPackage(buildDir);

const buildPackage = (format: Format = { config: 'tsconfig.json' }) => {
  const maybeBuild = specialBuilds[pkgName];
  const buildProcess = maybeBuild !== undefined ? maybeBuild : defaultBuild;
  buildProcess(format);
};

const defaultBuild = (format: Format) => {
  const tsProject = gulpTypescript.createProject(format.config);
  return gulp
    .src(['packages/*/src/**/*.ts'])
    .pipe(gulpFilter([`packages/blob-engine-${pkgName}/**/*`]))
    .pipe(tsProject())
    .pipe(flattenSource)
    .pipe(gulp.dest(getDest()));
};

const watchSource = () => {
  return gulp.watch(`packages/blob-engine-${pkgName}/**/*`, (done) => {
    buildPackage(undefined);
    done();
  });
};

const installDist = async () => {
  await execa('yarn install --non-interactive --no-progress', {
    cwd: 'dist',
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: true,
  });
};

// root builds
gulp.task('clean', (done) => {
  fs.removeSync('dist');
  done();
});

gulp.task('copyRootTSConfig', async (done) => {
  await copyRootTSConfig();
  done();
});

gulp.task('copyRootPkgJSON', (done) => {
  copyRootPkgJSON();
  done();
});

gulp.task('copyPkgFiles', (done) => {
  copyPkgJSON();
  done();
});

gulp.task('install', async (done) => {
  await installDist();
  done();
});

gulp.task('rootBuild', (done) => {
  gulp.series('clean', 'copyRootTSConfig', 'copyRootPkgJSON', 'copyPkgFiles')(done);
  done();
});

// package builds
gulp.task('build', (done) => {
  buildPackage(undefined);
  done();
});

gulp.task('watch', (done) => {
  watchSource();
  done();
});
