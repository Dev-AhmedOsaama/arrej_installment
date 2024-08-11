from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in installment/__init__.py
from installment import __version__ as version

setup(
	name="installment",
	version=version,
	description="installment",
	author="ahmedosama.dev@gmail.com",
	author_email="ahmedosama.dev@gmail.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
