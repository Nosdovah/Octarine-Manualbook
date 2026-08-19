import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContentViewer from '../components/ContentViewer';

const Manual = () => {
  const { slug } = useParams();

  if (!slug) {
    return <Navigate to="/manual/introduction" replace />;
  }

  return (
    <Layout>
      <ContentViewer slug={slug} />
    </Layout>
  );
};

export default Manual;
