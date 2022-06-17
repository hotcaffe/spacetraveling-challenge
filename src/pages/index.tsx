import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR/index.js';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { RichText } from 'prismic-dom';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}: HomeProps) {
  const [paginatedPost, setPaginatedPost] = useState<PostPagination>(postsPagination);

  // console.log(postsPagination.next_page)

  function nextPageFetch(e){
    e.preventDefault()
    fetch(postsPagination.next_page)
    .then(res => res.json())
    .then(res => {
      const posts = res.results.map(post => {
        return {
          uid: post.uid,
          first_publication_date: format(new Date(post.first_publication_date), 'PP', {
            locale: ptBR
          }),
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author
          }
        }
      })
      setPaginatedPost(paginatedPost => ({next_page: res.next_page, results: [...paginatedPost.results, ...posts]}))
      console.log(paginatedPost)
    })
  }

  return (
    <div className={commonStyles.common}>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={styles.content}>
        {paginatedPost.results.map(post => {
          return (
            <div key={post.uid} className={styles.post}>
              <Link href={`post/${post.uid}`}>
                <h3>{RichText.asText(post.data.title)}</h3>
              </Link>
              <span>{post.data.subtitle}</span>
              <div className={styles.info}>
                <time>
                  <FiCalendar/> {post.first_publication_date}
                </time>
                <span>
                  <FiUser/> {post.data.author}
                </span>
              </div>
            </div>
          )
        })}
        {paginatedPost.next_page ? <a href="" onClick={(e) => nextPageFetch(e)}>Carregar mais posts</a> : ''}
      </main>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async ({params}) => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 5
  });

  const posts = postsResponse.results.map(post => {
    return ({
      uid: post.uid,
      first_publication_date: format(new Date(post.first_publication_date), 'PP', {
        locale: ptBR
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    })
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts 
  }

  return {
    props: {
      postsPagination
    },
    revalidate: 60 * 60 //1 hour
  }
};
