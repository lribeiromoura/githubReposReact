/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import SubmitButton from '../../components/Button';
import { Loading, Owner, IssueList, ButtonsList } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          page: page < 1 ? 1 : page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleClick = async (e) => {
    e.preventDefault();
    this.setState({
      loading: true,
    });
    try {
      const { repository } = this.state;
      const page = 1;

      const response = await api.get(
        `/repos/${repository.full_name}/issues?page=${
          page < 1 ? 1 : page
        }?state=${e.currentTarget.textContent}`
      );
      console.log(response);
      this.setState({
        loading: false,
        issues: response.data,
      });
    } catch (error) {
      this.setState({
        loading: false,
      });
      console.log('Ex', error.message);
    }
  };

  handlePage = async (e) => {
    e.preventDefault();
    const { page, repository } = this.state;
    if (e.currentTarget.textContent === 'Anterior') {
      let newValuePage = page;
      if (newValuePage === 1) {
        return;
      }
      newValuePage = page - 1;
      this.setState({
        page: newValuePage,
      });
      const response = await api.get(
        `/repos/${repository.full_name}/issues?page=${newValuePage}`
      );
      this.setState({
        issues: response.data,
      });
    } else {
      const newValuePage = page + 1;
      this.setState({
        page: newValuePage,
      });
      const response = await api.get(
        `/repos/${repository.full_name}/issues?page=${newValuePage}`
      );
      this.setState({
        issues: response.data,
      });
    }
  };

  render() {
    const { repository, issues, loading } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <ButtonsList>
          <SubmitButton onClick={this.handleClick}>all</SubmitButton>
          <SubmitButton onClick={this.handleClick}>open</SubmitButton>
          <SubmitButton onClick={this.handleClick}>closed</SubmitButton>
        </ButtonsList>

        <IssueList>
          {issues.map((issue) => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map((label) => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <ButtonsList>
          <SubmitButton onClick={this.handlePage}>Anterior</SubmitButton>
          <SubmitButton onClick={this.handlePage}>Próxima</SubmitButton>
        </ButtonsList>
      </Container>
    );
  }
}
