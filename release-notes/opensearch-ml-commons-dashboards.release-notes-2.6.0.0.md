## Version 2.6.0.0 Release Notes

Compatible with OpenSearch 2.6.0

### Experimental Features

* Add RefreshInterval component ([#32](https://github.com/opensearch-project/ml-commons-dashboards/pull/32))
* Add useMonitoring hook ([#33](https://github.com/opensearch-project/ml-commons-dashboards/pull/33))
* Add status filter ([#34](https://github.com/opensearch-project/ml-commons-dashboards/pull/34))
* Add experiment banner ([#37](https://github.com/opensearch-project/ml-commons-dashboards/pull/37))
* Add model deployment table ([#40](https://github.com/opensearch-project/ml-commons-dashboards/pull/40))
* Add preview panel ([#41](https://github.com/opensearch-project/ml-commons-dashboards/pull/41))
* Add model deployment search bar ([#42](https://github.com/opensearch-project/ml-commons-dashboards/pull/42))
* Integrate auto refresh with data load API ([#43](https://github.com/opensearch-project/ml-commons-dashboards/pull/43))
* Add not allowed exclusions to status filter ([#48](https://github.com/opensearch-project/ml-commons-dashboards/pull/48))
* Add preview panel loading screen ([#51](https://github.com/opensearch-project/ml-commons-dashboards/pull/51))
* Update status filter dot color and model profile API response ([#61](https://github.com/opensearch-project/ml-commons-dashboards/pull/61))
* Reload model list after closed preview panel data changed ([#62](https://github.com/opensearch-project/ml-commons-dashboards/pull/62))
* Update monitoring page pathname ([#64](https://github.com/opensearch-project/ml-commons-dashboards/pull/64))
* Add admin UI ([#67](https://github.com/opensearch-project/ml-commons-dashboards/pull/67))

### Enhancements

* Rename searchByName to searchByNameOrId ([#44](https://github.com/opensearch-project/ml-commons-dashboards/pull/44))
* Update status filter change fired event and parameters ([#47](https://github.com/opensearch-project/ml-commons-dashboards/pull/47))
* Add model id restriction in model profile API ([#94](https://github.com/opensearch-project/ml-commons-dashboards/pull/94))

### Bug Fixes

* Update page title to 'Overview' ([#54](https://github.com/opensearch-project/ml-commons-dashboards/pull/54))
* Fix search text disappear after search API called ([#60](https://github.com/opensearch-project/ml-commons-dashboards/pull/60))
* Fix no node count pass to model search API ([#65](https://github.com/opensearch-project/ml-commons-dashboards/pull/65))
* Fix redirect index pattern when no sample data ([#70](https://github.com/opensearch-project/ml-commons-dashboards/pull/70))
* Fix model name search tokenization and case ([#71](https://github.com/opensearch-project/ml-commons-dashboards/pull/71))
* Fix blank page after profile API returns empty object ([#73](https://github.com/opensearch-project/ml-commons-dashboards/pull/73))
* Fix route redirect for monitoring page ([#74](https://github.com/opensearch-project/ml-commons-dashboards/pull/74))
* Fix model state PARTIAL_LOADED not aligned with ml-commons API ([#75](https://github.com/opensearch-project/ml-commons-dashboards/pull/75))
* Fix ModelSearchItem model_version field not aligned with ml-commons API ([#76](https://github.com/opensearch-project/ml-commons-dashboards/pull/76))
* Fix blank preview panel caused by model not responding ([#79](https://github.com/opensearch-project/ml-commons-dashboards/pull/79))
* Fix refresh interval and model table responsive UI ([#86](https://github.com/opensearch-project/ml-commons-dashboards/pull/86))
* Fix URL address, experimental banner, model table UI and sorting ([#87](https://github.com/opensearch-project/ml-commons-dashboards/pull/87))
* Fix preview panel UI and sorting ([#88](https://github.com/opensearch-project/ml-commons-dashboards/pull/88))
* Fix always show "Copied" after mouse re-enters ([#89](https://github.com/opensearch-project/ml-commons-dashboards/pull/89))

### Infrastructure

* Add unit tests workflow ([#3](https://github.com/opensearch-project/ml-commons-dashboards/pull/3))
* Use husky@3.1.0 and lint-staged@10.5.4 ([#5](https://github.com/opensearch-project/ml-commons-dashboards/pull/5))
* Add GitHub lint workflow ([#39](https://github.com/opensearch-project/ml-commons-dashboards/pull/39))

### Documentation

* Add developer guide and contributing document ([#28](https://github.com/opensearch-project/ml-commons-dashboards/pull/28))
* Add maintainers document ([#81](https://github.com/opensearch-project/ml-commons-dashboards/pull/81))

### Refactoring

* Refactor model deployment table with no items message ([#46](https://github.com/opensearch-project/ml-commons-dashboards/pull/46))
* Refactor status filter with static options ([#55](https://github.com/opensearch-project/ml-commons-dashboards/pull/55))
* Update profile API for model preview ([#57](https://github.com/opensearch-project/ml-commons-dashboards/pull/57))
* Refactor deployed model fetcher with model search API ([#58](https://github.com/opensearch-project/ml-commons-dashboards/pull/58))

