// tslint:disable
import gulp from 'gulp';
import path from 'path';
import gulpFilter from 'gulp-filter';
import gulpRename from 'gulp-rename';
import gulpTypescript from 'gulp-typescript';
import fs from 'fs-extra';

interface Format {
  readonly config: string;
}

type BuildFunc = (format: Format) => void;

const packagesPath = path.resolve(__dirname, 'packages');
const basePath = path.resolve(packagesPath, 'blob-engine-');
const specialBuilds: Record<string, BuildFunc | undefined> = {};

const getPackage = (dir: string) => dir.substring(basePath.length);
const getDest = () => path.join('dist', 'packages');

const getInitDir = () => {
  const initDir = process.env.INIT_CWD;
  if (initDir === undefined) {
    throw new Error('cant determine package');
  }
  return initDir;
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

const getDefaultBuild = (pkgName: string) => (format: Format) => {
  const tsProject = gulpTypescript.createProject(format.config);
  return gulp
    .src(['packages/*/src/**/*.ts'])
    .pipe(gulpFilter([`packages/blob-engine-${pkgName}/**/*`]))
    .pipe(tsProject())
    .js.pipe(flattenSource)
    .pipe(gulp.dest(getDest()));
};

const buildPackage = (format: Format = { config: 'tsconfig.json' }) => {
  const buildDir = getInitDir();
  const pkgName = getPackage(buildDir);
  const maybeBuild = specialBuilds[pkgName];
  const buildProcess = maybeBuild !== undefined ? maybeBuild : getDefaultBuild(pkgName);
  buildProcess(format);
};

gulp.task('build', (done) => {
  buildPackage(undefined);
  done();
});

gulp.task('clean', (done) => {
  fs.removeSync('dist');
  done();
});
