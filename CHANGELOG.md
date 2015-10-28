# Release 1.1.4 (2015-10-28)
- Killed the bug of horrible that prevented values from being output.
  - Caused by 1.1.3.
  - Fixed #16, #14, #15, #5.

# Release 1.1.3 (2015-10-24)
- Killed the exponential increase in $$listenerCount.
  - Fixed #5

# Release 1.1.2 (2015-10-09)
- Killed some odd looking whitespace.

# Release 1.1.1 (2015-08-24)
- Partially fixed an issue with object literals in notifier expressions
  - Reference issues: #3, #4.

# Release 1.1.0 (2015-07-28)

- Added: `Notifier` factory to allow setting up notification namespaces without a bind-notifier directive.
- Added: ngDoc!
- Added: CHANGELOG.md.
- Added: `Notifier` entry in README.
- Added: @license property to src.
- Changed: Refactored a bunch of the source code (mucho better naming).
- Changed: Cleaned up the README.

# Release 1.0.1 (2015-07-25)

- Changed: Removed bloat data from internal $broadcast events.

# Release 1.0.0 (2015-07-25)

- Changed: Renamed module to `angular.bind.notifier`.
- Changed: Updated the README to reflect the latest changes.
- Changed: Changed from JSON to JS Object notation in bind-notifier directive.
- Changed: Squashed /src folder into a single file.
- Added: Added TravisCI integration.

# Release 0.0.7 (2015-04-19)

- Fixed: Removed npm entry of README.

# Release 0.0.6 (2015-04-19)

- Added: Added support for multiple notifier namespaces.
- Fixed: Fixed bug that prevented deep watches.

# Release 0.0.5 (2015-04-19)

- Changed: Reverted 0.0.3

# Release 0.0.4 (2015-04-19)

- Changed: Removed internal dependency on lodash.

# Release 0.0.3 (2015-04-19)

- Changed: Changed the main entry point of .json files.

# Release 0.0.2 (2015-04-19)

- Fixed: Fixed the build process.

# Release 0.0.1 (2015-04-19)

- Initial release.
